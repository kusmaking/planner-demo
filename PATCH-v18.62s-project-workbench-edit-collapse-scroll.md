# v18.62s — Project workbench edit/collapse/scroll polish

Base: v18.62r-project-workbench-edit-scroll-layout-polish-sandbox

Scope: Project workbench only.

Changes:
- Fixed Rediger prosjekt click handling by binding edit buttons directly, including the floating control island.
- Kept the existing project edit modal and raised it above the workbench.
- Changed wheel behavior so the calendar behind the workbench does not scroll while the pointer is over the workbench.
- Ledig hele perioden is open by default.
- Delvis ledig and Opptatt / overbook are collapsed by default and can be opened when needed.
- Reduced nested scrolling by using one main scroll area for candidate sections instead of several small list scrolls.

Not changed:
- Login
- Supabase
- RLS
- Edge Functions
- Calendar data/rendering logic
- Assignment save logic
- Overbooking logic
- Main branch

Validation:
- node --check app.js OK
