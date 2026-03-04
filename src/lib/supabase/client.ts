import { createBrowserClient } from "@supabase/ssr";

// Use static string literals — Next.js/Turbopack can only inline process.env
// at build time when the key is a compile-time constant, not a dynamic variable.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_URL");
if (!SUPABASE_ANON_KEY) throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const createClient = () => createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
