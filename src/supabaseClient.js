import { createClient } from '@supabase/supabase-js';

/** Real env bo‘lmasa ham ilova ochiladi; so‘rovlar keyin .env qo‘yilganda ishlaydi */
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InBsYWNlaG9sZGVyIn0.placeholder';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || PLACEHOLDER_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || PLACEHOLDER_ANON_KEY;

if (process.env.NODE_ENV === 'development' && (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY)) {
    // eslint-disable-next-line no-console
    console.warn('[supabase] REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY yo‘q — placeholder client');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
