import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6560cc25-1517-4290-b0c9-e3c8a210c1d7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/entries/route.ts:4',message:'GET /api/entries called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  try {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6560cc25-1517-4290-b0c9-e3c8a210c1d7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/entries/route.ts:7',message:'Creating server client',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const supabase = await createServerClient();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6560cc25-1517-4290-b0c9-e3c8a210c1d7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/entries/route.ts:10',message:'Getting user from auth',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6560cc25-1517-4290-b0c9-e3c8a210c1d7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/entries/route.ts:12',message:'Auth result',data:{hasUser:!!user,hasError:!!authError,errorMsg:authError?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the latest entry with all its blocks
    const { data: latestEntry, error: entryError } = await supabase
      .from('entries')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (entryError || !latestEntry) {
      return NextResponse.json({ entry: null, blocks: [] });
    }

    // Get all blocks for this entry
    const { data: blocks, error: blocksError } = await supabase
      .from('blocks')
      .select('*')
      .eq('entry_id', latestEntry.id)
      .order('order_index', { ascending: true });

    if (blocksError) {
      return NextResponse.json(
        { error: 'Failed to fetch blocks' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      entry: latestEntry,
      blocks: blocks || [],
    });
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/6560cc25-1517-4290-b0c9-e3c8a210c1d7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/api/entries/route.ts:50',message:'ERROR in GET /api/entries',data:{errorMsg:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    console.error('Entries API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
