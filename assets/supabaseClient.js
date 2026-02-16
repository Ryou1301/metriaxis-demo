/* global supabase */
window.sb = (function(){
  const cfg = window.METRIAXIS_CONFIG || {};
  if(!cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY){
    throw new Error("Missing SUPABASE config. Check assets/config.js");
  }
  return supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
})();
