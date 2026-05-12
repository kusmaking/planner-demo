# PATCH v18.62r — Project workbench edit, scroll and layout polish

Base: `v18.62q-project-workbench-restore-floating-close-edit-sandbox`

Scope: Project workbench only.

Changes:
- Keeps the floating project workbench behavior from v18.62q.
- Makes `Rediger prosjekt` more explicit in the floating control island.
- Routes all project edit buttons through a dedicated workbench edit handler.
- Forces the existing project edit modal above the workbench so it does not open behind the project card.
- Improves mouse-wheel handling:
  - wheel over the project workbench does not scroll the calendar behind it;
  - inner scrollable sections still scroll when they have available scroll range;
  - at scroll boundaries, wheel is contained so the background does not jump.
- Gives more space to project data, periods and assigned crew.
- Compresses the availability candidate sections so available/partial/busy candidates dominate less of the window.

Not changed:
- Login/auth
- Supabase schema
- RLS
- Edge Functions
- Calendar data model
- Assignment/overbooking save logic
- Import
- Main branch

Validation:
- `node --check app.js` OK
