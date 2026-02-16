Metriaxis Demo (Netlify) — UX v3
================================

Ajouts (orientation QUALIMS):
- Planning global: v_ui_planning_upcoming
- Liste équipements: v_ui_equipment_list (jointures + champs enrichis)
- Documents: onglet dans la fiche équipement (table documents)
  -> Ajout de documents sous forme de liens (URL) en utilisant storage_path

Limites actuelles (proche de QUALIMS mais pas encore):
- Pas de workflow validation/signature
- Pas de gestion de tâches/relances
- Pas d’upload Supabase Storage (juste liens)


Upload (Storage)
- Bucket par défaut: documents (config.js: STORAGE_BUCKET)
- Nécessite policies Storage + RLS documents autorisant insert pour user authentifié.


v1.3:
- Création opération: type d’opération filtré = classic + tests réellement paramétrés (templates actifs)


GitHub Pages
- Tous les chemins sont relatifs (pas de /assets/...)
- 404.html redirige vers index.html


v1.5:
- test_new: suppression du champ Template
- test_new: sélection d’équipement via liste (numéro interne) + fallback
