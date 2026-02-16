async function fetchStatusMap(){
  const { data, error } = await sb.from('status_codes')
    .select('id,label,severity,color_hex,code')
    .eq('client_id', getClientId());
  if(error) throw error;
  const map = {};
  (data||[]).forEach(s=>{ map[s.id]=s; });
  return map;
}

async function fetchEquipmentListUI(){
  const { data, error } = await sb.from('v_ui_equipment_list')
    .select('*')
    .eq('client_id', getClientId())
    .order('designation', {ascending:true});
  if(error) throw error;
  return data||[];
}

async function fetchPlanningUpcoming(){
  const { data, error } = await sb.from('v_ui_planning_upcoming')
    .select('*')
    .eq('client_id', getClientId())
    .order('next_due_date', {ascending:true});
  if(error) throw error;
  return data||[];
}

async function fetchEquipment(id){
  const { data, error } = await sb.from('equipment')
    .select('*')
    .eq('client_id', getClientId())
    .eq('id', id)
    .single();
  if(error) throw error;
  return data;
}

async function fetchEquipmentDetails(equipment_id){
  const { data, error } = await sb.from('equipment_details')
    .select('*')
    .eq('client_id', getClientId())
    .eq('equipment_id', equipment_id)
    .maybeSingle();
  if(error) throw error;
  return data;
}

async function fetchEquipmentTests(equipment_id){
  const { data, error } = await sb.from('equipment_tests')
    .select('*')
    .eq('client_id', getClientId())
    .eq('equipment_id', equipment_id)
    .order('next_due_date', {ascending:true});
  if(error) throw error;
  return data||[];
}

async function fetchOperations(equipment_id){
  const { data, error } = await sb.from('operations')
    .select('*')
    .eq('client_id', getClientId())
    .eq('equipment_id', equipment_id)
    .order('performed_at', {ascending:false});
  if(error) throw error;
  return data||[];
}

async function fetchStatusHistory(equipment_id){
  const { data, error } = await sb.from('status_history')
    .select('*')
    .eq('client_id', getClientId())
    .eq('equipment_id', equipment_id)
    .order('changed_at', {ascending:false});
  if(error) throw error;
  return data||[];
}

async function fetchAuditLogForEquipment(equipment_id){
  const { data, error } = await sb.from('audit_log')
    .select('id,changed_at,action,table_name,record_id,old_data,new_data')
    .eq('client_id', getClientId())
    .eq('record_id', equipment_id)
    .order('changed_at', {ascending:false})
    .limit(200);
  if(error) throw error;
  return data||[];
}

async function fetchDocumentsForEquipment(equipment_id){
  const { data, error } = await sb.from('documents')
    .select('id,file_name,storage_path,mime_type,size_bytes,doc_type,tags,equipment_id,uploaded_at')
    .eq('client_id', getClientId())
    .eq('equipment_id', equipment_id)
    .order('uploaded_at', {ascending:false});
  if(error) throw error;
  return data||[];
}

async function fetchDocumentsForOperations(operation_ids){
  if(!operation_ids || !operation_ids.length) return [];
  const { data, error } = await sb.from('documents')
    .select('id,file_name,storage_path,doc_type,tags,operation_id,uploaded_at')
    .eq('client_id', getClientId())
    .in('operation_id', operation_ids)
    .order('uploaded_at', {ascending:false});
  if(error) throw error;
  return data||[];
}

async function fetchDocumentsForTests(test_ids){
  if(!test_ids || !test_ids.length) return [];
  const { data, error } = await sb.from('documents')
    .select('id,file_name,storage_path,doc_type,tags,equipment_test_id,uploaded_at')
    .eq('client_id', getClientId())
    .in('equipment_test_id', test_ids)
    .order('uploaded_at', {ascending:false});
  if(error) throw error;
  return data||[];
}

async function createDocumentLink(payload){
  const { error } = await sb.from('documents').insert(payload);
  if(error) throw error;
}
