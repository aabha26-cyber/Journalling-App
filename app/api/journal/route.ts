import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const GPT_MODEL = 'gpt-4-turbo';

export async function POST(request: NextRequest) {
  try {
    const { text, entryId } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Journal text cannot be empty' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Get the current user (required for RLS)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let currentEntryId = entryId;

    // If no entryId, create a new entry
    if (!currentEntryId) {
      const { data: newEntry, error: entryError } = await supabase
        .from('entries')
        .insert({ user_id: user.id })
        .select()
        .single();

      if (entryError || !newEntry) {
        return NextResponse.json(
          { error: 'Failed to create entry' },
          { status: 500 }
        );
      }

      currentEntryId = newEntry.id;
    }

    // Get all human blocks for this entry to send to GPT
    const { data: existingBlocks, error: blocksError } = await supabase
      .from('blocks')
      .select('*')
      .eq('entry_id', currentEntryId)
      .eq('block_type', 'human')
      .order('order_index', { ascending: true });

    if (blocksError) {
      return NextResponse.json(
        { error: 'Failed to fetch existing blocks' },
        { status: 500 }
      );
    }

    // Get the next order index
    const { data: allBlocks } = await supabase
      .from('blocks')
      .select('order_index')
      .eq('entry_id', currentEntryId)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = allBlocks && allBlocks.length > 0
      ? allBlocks[0].order_index + 1
      : 0;

    // Save the human block first
    const { error: saveError } = await supabase
      .from('blocks')
      .insert({
        entry_id: currentEntryId,
        block_type: 'human',
        content: text.trim(),
        order_index: nextOrderIndex,
      });

    if (saveError) {
      return NextResponse.json(
        { error: 'Failed to save journal entry' },
        { status: 500 }
      );
    }

    // Build GPT input: all human blocks so far (including the one just saved)
    const allHumanTexts = existingBlocks
      ? [...existingBlocks.map(b => b.content), text.trim()]
      : [text.trim()];

    const journalText = allHumanTexts.join('\n\n');

    // Call GPT-4-turbo
    let gptResponse;
    try {
      const completion = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a thoughtful journaling assistant. Reflect deeply but concisely on the user\'s journal entry. Avoid being preachy or prescriptive. Return only valid JSON with no markdown formatting.',
          },
          {
            role: 'user',
            content: `Journal entry:\n\n${journalText}\n\nProvide a thoughtful reflection (3-5 sentences total) as an array of strings, and exactly 2 open-ended follow-up questions. Return JSON in this exact format:\n{\n  "reflections": ["sentence 1", "sentence 2", ...],\n  "questions": ["question 1", "question 2"]\n}\n\nTone: calm, introspective, non-judgmental.`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from GPT');
      }

      gptResponse = JSON.parse(content);
    } catch (gptError) {
      // GPT failed, but human block is already saved
      return NextResponse.json(
        { error: 'Reflection failed. Try again.', entryId: currentEntryId },
        { status: 500 }
      );
    }

    // Validate GPT response structure
    if (
      !gptResponse ||
      typeof gptResponse !== 'object' ||
      !Array.isArray(gptResponse.reflections) ||
      !Array.isArray(gptResponse.questions) ||
      gptResponse.questions.length !== 2
    ) {
      return NextResponse.json(
        { error: 'Reflection failed. Try again.', entryId: currentEntryId },
        { status: 500 }
      );
    }

    // Save AI block
    const aiContent = JSON.stringify({
      reflections: gptResponse.reflections,
      questions: gptResponse.questions,
    });

    const { error: aiBlockError } = await supabase
      .from('blocks')
      .insert({
        entry_id: currentEntryId,
        block_type: 'ai',
        content: aiContent,
        order_index: nextOrderIndex + 1,
      });

    if (aiBlockError) {
      // AI block save failed, but human block is saved
      return NextResponse.json(
        { error: 'Failed to save reflection', entryId: currentEntryId },
        { status: 500 }
      );
    }

    return NextResponse.json({
      entryId: currentEntryId,
      reflections: gptResponse.reflections,
      questions: gptResponse.questions,
    });
  } catch (error) {
    console.error('Journal API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
