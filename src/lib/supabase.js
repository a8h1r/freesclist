// Supabase Client Initialization for FreeSCList
const SUPABASE_URL = "https://irfjjoyqhfxqjpbmhtsn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZmpqb3lxaGZ4cWpwYm1odHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MTkxMTMsImV4cCI6MjEwMjQ5NTExM30.N-M88ZsUFUXSyAvrJq5tuGF8mWp5Gj0pmSUimx3L67M";

let supabaseClient = null;

function getSupabase() {
    if (!supabaseClient) {
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        } else {
            console.error("Supabase SDK not loaded. Make sure script @supabase/supabase-js is included.");
        }
    }
    return supabaseClient;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getSupabase, SUPABASE_URL, SUPABASE_ANON_KEY };
}
