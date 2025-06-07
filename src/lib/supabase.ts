import { createClient } from '@supabase/supabase-js';

// Log all available environment variables (excluding sensitive values)
console.log('Available Vite env variables:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'defined' : 'undefined',
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'defined' : 'undefined',
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Initializing Supabase client...');

// Validate URL format
try {
  if (supabaseUrl) {
    const url = new URL(supabaseUrl);
    console.log('Supabase URL is valid:', url.hostname);
    if (!url.hostname.includes('supabase.co')) {
      console.warn('Warning: Supabase URL does not contain supabase.co');
    }
  } else {
    throw new Error('Supabase URL is missing');
  }

  if (!supabaseAnonKey) {
    throw new Error('Supabase Anon Key is missing');
  }

  // Log the first and last 4 characters of the key for debugging
  const keyLength = supabaseAnonKey.length;
  if (keyLength > 8) {
    console.log('Anon Key format:', `${supabaseAnonKey.slice(0, 4)}...${supabaseAnonKey.slice(-4)}`);
  } else {
    console.error('Anon Key is too short - should be a long string');
  }

} catch (error) {
  console.error('Supabase configuration error:', error);
  throw error;
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file and make sure it contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test the connection immediately
console.log('Testing Supabase connection...');
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Failed to connect to Supabase:', error.message);
  } else {
    console.log('Successfully connected to Supabase');
  }
});

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);
});

// Storage bucket name for PDFs (manually created in Supabase dashboard)
export const STORAGE_BUCKET = 'blueprints'; 