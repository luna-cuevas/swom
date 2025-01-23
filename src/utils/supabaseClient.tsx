import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        realtime: {
          heartbeatIntervalMs: 5000,
        },
      }
    );
  }
  return supabase;
};

export const getSupabaseAdmin = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        heartbeatIntervalMs: 5000,
      },
    }
  );
};
