import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        detectSessionInUrl: true,
        flowType: "pkce",
        persistSession: true,
      },
    })
  : null;

export function getDisplayName(user) {
  return (
    user?.user_metadata?.user_name ||
    user?.user_metadata?.name ||
    user?.email ||
    "signed-in visitor"
  );
}
