import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CHAT_MODEL = "gpt-4-turbo";

export async function POST(req: NextRequest) {
  try {
    if (!openai.apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const messages = body?.messages as { role: "user" | "assistant"; content: string }[] | undefined;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required." },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a warm, supportive journaling companion. Ask gentle questions, reflect back themes you notice, and never give medical or legal advice.",
        },
        ...messages,
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong talking to the AI." },
      { status: 500 }
    );
  }
}

