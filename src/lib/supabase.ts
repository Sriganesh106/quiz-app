import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://axoqioctnzpeqwmvkswd.supabase.co';
const supabaseKey = 'your-anon-key-here';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'  // Explicitly set the schema
  }
});