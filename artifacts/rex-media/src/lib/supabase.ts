import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && anonKey);
export const supabase = supabaseConfigured ? createClient(url!, anonKey!) : null;
export const setupMessage = 'Booking and admin tools need VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Add both to the app environment, then reload.';