import { createClient } from '@supabase/supabase-js';

const PW_RECOVERY_SESSION_KEY = 'techgear_pw_recovery_pending';

/**
 * Parol tiklash havolasi #access_token=...&type=recovery bilan keladi.
 * getSession() URL ni parse qilib hashni tozalaguncha, recovery belgisini saqlab qolamiz.
 */
function capturePasswordRecoveryFromUrlToSessionStorage() {
    if (typeof window === 'undefined') return;
    try {
        const hash = (window.location.hash || '').replace(/^#/, '');
        if (new URLSearchParams(hash).get('type') === 'recovery') {
            sessionStorage.setItem(PW_RECOVERY_SESSION_KEY, '1');
            return;
        }
        const search = (window.location.search || '').replace(/^\?/, '');
        if (new URLSearchParams(search).get('type') === 'recovery') {
            sessionStorage.setItem(PW_RECOVERY_SESSION_KEY, '1');
        }
    } catch {
        /* ignore */
    }
}

capturePasswordRecoveryFromUrlToSessionStorage();

export function isPasswordRecoveryPending() {
    try {
        return sessionStorage.getItem(PW_RECOVERY_SESSION_KEY) === '1';
    } catch {
        return false;
    }
}

export function clearPasswordRecoveryPending() {
    try {
        sessionStorage.removeItem(PW_RECOVERY_SESSION_KEY);
    } catch {
        /* ignore */
    }
}

export function markPasswordRecoveryPending() {
    try {
        sessionStorage.setItem(PW_RECOVERY_SESSION_KEY, '1');
    } catch {
        /* ignore */
    }
}

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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
});
