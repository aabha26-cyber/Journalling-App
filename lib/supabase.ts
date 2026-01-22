import { createBrowserClient } from '@supabase/ssr';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/6560cc25-1517-4290-b0c9-e3c8a210c1d7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase.ts:4',message:'Checking env vars',data:{hasUrl:!!process.env.NEXT_PUBLIC_SUPABASE_URL,hasKey:!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// #region agent log
fetch('http://127.0.0.1:7242/ingest/6560cc25-1517-4290-b0c9-e3c8a210c1d7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase.ts:10',message:'Env vars check result',data:{urlLength:supabaseUrl?.length||0,keyLength:supabaseAnonKey?.length||0,willThrow:!supabaseUrl||!supabaseAnonKey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion
if (!supabaseUrl || !supabaseAnonKey) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/6560cc25-1517-4290-b0c9-e3c8a210c1d7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase.ts:13',message:'ERROR: Missing env vars',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  throw new Error('Missing Supabase environment variables');
}

// #region agent log
fetch('http://127.0.0.1:7242/ingest/6560cc25-1517-4290-b0c9-e3c8a210c1d7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase.ts:18',message:'Creating browser client with cookies',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
// #endregion
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
// #region agent log
fetch('http://127.0.0.1:7242/ingest/6560cc25-1517-4290-b0c9-e3c8a210c1d7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/supabase.ts:22',message:'Browser client created successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
// #endregion
