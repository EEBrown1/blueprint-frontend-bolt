import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file and make sure it contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Validate URL format
try {
  if (supabaseUrl) {
    new URL(supabaseUrl);
  }
} catch (error) {
  throw new Error('Invalid Supabase URL format');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name for PDFs
export const STORAGE_BUCKET = 'blueprints'; 