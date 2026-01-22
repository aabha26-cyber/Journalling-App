import { createServerClient as createSupabaseServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// #region agent log
// Server-side logging - write directly to file
import { appendFile } from 'fs/promises';
appendFile('/Users/dilippatil/Desktop/relfection-app/.cursor/debug.log', JSON.stringify({location:'lib/supabase-server.ts:4',message:'Server: Checking env vars',data:{hasUrl:!!process.env.NEXT_PUBLIC_SUPABASE_URL,hasKey:!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n').catch(()=>{});
// #endregion
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// #region agent log
appendFile('/Users/dilippatil/Desktop/relfection-app/.cursor/debug.log', JSON.stringify({location:'lib/supabase-server.ts:9',message:'Server: Env vars check result',data:{urlLength:supabaseUrl?.length||0,keyLength:supabaseAnonKey?.length||0,willThrow:!supabaseUrl||!supabaseAnonKey},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n').catch(()=>{});
// #endregion
if (!supabaseUrl || !supabaseAnonKey) {
  // #region agent log
  appendFile('/Users/dilippatil/Desktop/relfection-app/.cursor/debug.log', JSON.stringify({location:'lib/supabase-server.ts:12',message:'Server: ERROR Missing env vars',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n').catch(()=>{});
  // #endregion
  throw new Error('Missing Supabase environment variables');
}

export async function createServerClient() {
  // #region agent log
  appendFile('/Users/dilippatil/Desktop/relfection-app/.cursor/debug.log', JSON.stringify({location:'lib/supabase-server.ts:18',message:'Server: createServerClient called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n').catch(()=>{});
  // #endregion
  const cookieStore = await cookies();
  
  // #region agent log
  const allCookies = cookieStore.getAll();
  const supabaseCookies = allCookies.filter(c => c.name.includes('supabase') || c.name.includes('sb-'));
  appendFile('/Users/dilippatil/Desktop/relfection-app/.cursor/debug.log', JSON.stringify({location:'lib/supabase-server.ts:24',message:'Server: Cookies available',data:{totalCookies:allCookies.length,supabaseCookies:supabaseCookies.map(c=>c.name)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n').catch(()=>{});
  // #endregion
  
  // #region agent log
  appendFile('/Users/dilippatil/Desktop/relfection-app/.cursor/debug.log', JSON.stringify({location:'lib/supabase-server.ts:28',message:'Server: Creating Supabase client with SSR',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})+'\n').catch(()=>{});
  // #endregion
  return createSupabaseServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set(name, value, options);
        } catch (error) {
          // Ignore errors in server components
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.delete(name);
        } catch (error) {
          // Ignore errors in server components
        }
      },
    },
  });
}
