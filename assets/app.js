function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }
function getParam(name){ return new URLSearchParams(location.search).get(name); }

function fmtDate(d){
  if(!d) return "";
  const dt = new Date(d);
  if(Number.isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString('fr-FR');
}
function fmtDateTime(d){
  if(!d) return "";
  const dt = new Date(d);
  if(Number.isNaN(dt.getTime())) return String(d);
  return dt.toLocaleString('fr-FR');
}

function setNotice(el, msg, type){
  if(!el) return;
  el.classList.remove('ok','err','info');
  if(!msg){ el.style.display='none'; el.textContent=''; return; }
  el.textContent = msg;
  el.style.display='block';
  el.classList.add(type || 'info');
}

function badgeForSeverity(sev){
  if(sev === null || sev === undefined) return '<span class="badge gray dot">N/A</span>';
  const s = Number(sev);
  if(s >= 3) return '<span class="badge red dot">Critique</span>';
  if(s === 2) return '<span class="badge orange dot">Alerte</span>';
  if(s === 1) return '<span class="badge orange dot">Surveillance</span>';
  return '<span class="badge green dot">OK</span>';
}

function ensureToastRoot(){
  let root = qs('.toast-wrap');
  if(!root){
    root = document.createElement('div');
    root.className = 'toast-wrap';
    document.body.appendChild(root);
  }
  return root;
}
function toast(title, message, type='info', ttl=3200){
  const root = ensureToastRoot();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<div><div class="t"></div><div class="m"></div></div><div class="x">✕</div>`;
  el.querySelector('.t').textContent = title || (type==='ok'?'OK':type==='err'?'Erreur':'Info');
  el.querySelector('.m').textContent = message || '';
  el.querySelector('.x').addEventListener('click', ()=> el.remove());
  root.appendChild(el);
  setTimeout(()=>{ if(el.isConnected) el.remove(); }, ttl);
}

async function requireAuth(){
  const { data } = await sb.auth.getSession();
  if(!data.session){
    location.href = "index.html";
    return null;
  }
  return data.session;
}

function getClientId(){
  return localStorage.getItem('metriaxis_client_id');
}

async function initShell(activePage){
  const session = await sb.auth.getSession();
  const email = session.data.session?.user?.email || "";

  qs('#userEmail') && (qs('#userEmail').textContent = email);

  qsa('.nav a').forEach(a=>{
    if(a.dataset.page === activePage) a.classList.add('active');
  });

  const sel = qs('#clientSelect');
  if(sel){
    const { data: clients, error } = await sb.from('clients').select('id,name,code,is_active').order('created_at', {ascending:true});
    if(error){
      setNotice(qs('#shellNotice'), "Erreur chargement clients: " + error.message, 'err');
      return;
    }
    sel.innerHTML = (clients||[]).map(c=>`<option value="${c.id}">${c.name} (${c.code || '—'})</option>`).join('');

    const stored = localStorage.getItem('metriaxis_client_id');
    const first = clients?.[0]?.id;
    const useId = stored && (clients||[]).some(c=>c.id===stored) ? stored : first;
    if(useId){
      sel.value = useId;
      localStorage.setItem('metriaxis_client_id', useId);
    }
    sel.addEventListener('change', ()=>{
      localStorage.setItem('metriaxis_client_id', sel.value);
      location.reload();
    });

    // meta display
    const client = (clients||[]).find(c=>c.id===useId);
    if(qs('#clientMetaName')) qs('#clientMetaName').textContent = client?.name || '—';
    if(qs('#clientMetaCode')) qs('#clientMetaCode').textContent = client?.code || '—';
  }

  const btn = qs('#logoutBtn');
  if(btn){
    btn.addEventListener('click', async ()=>{
      await sb.auth.signOut();
      location.href = "index.html";
    });
  }
}

// lightweight cache for lookups
const cache = {};
async function lookup(table, fields='id,name'){
  const key = `${table}:${fields}:${getClientId()}`;
  if(cache[key]) return cache[key];
  const { data, error } = await sb.from(table).select(fields).eq('client_id', getClientId());
  if(error) throw error;
  cache[key] = data || [];
  return cache[key];
}


// Upload helper (Supabase Storage + documents table)
async function uploadFileToStorage(file, {prefix=''} = {}){
  const bucket = (window.METRIAXIS_CONFIG && window.METRIAXIS_CONFIG.STORAGE_BUCKET) || 'documents';
  const ext = (file.name || '').split('.').pop();
  const safeName = (file.name || 'file').replace(/[^a-zA-Z0-9._-]/g,'_');
  const path = `${getClientId()}/${prefix}${Date.now()}_${Math.random().toString(16).slice(2)}_${safeName}`;
  const { data, error } = await sb.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined
  });
  if(error) throw error;
  // store canonical storage path "bucket/path"
  return { bucket, path: data.path, storage_path: `${bucket}/${data.path}` };
}

async function insertDocumentRow({file_name, storage_path, doc_type=null, tags=null, equipment_id=null, equipment_test_id=null, operation_id=null}){
  const payload = {
    client_id: getClientId(),
    file_name,
    storage_path,
    mime_type: null,
    size_bytes: null,
    doc_type,
    tags,
    equipment_id,
    equipment_test_id,
    operation_id
  };
  const { data, error } = await sb.from('documents').insert(payload).select('id').single();
  if(error) throw error;
  return data;
}
