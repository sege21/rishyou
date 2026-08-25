import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ixozefflfslakygqekwg.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_Mcunyl3K6rKNRTo28PEsng__bdxNDIa";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);