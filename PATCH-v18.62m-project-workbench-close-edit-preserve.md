# v18.62m — Project workbench close/edit controls

Scope: project workbench only.

Changes:
- Added a dedicated Outlook-style window chrome/titlebar at the top of the project workbench.
- Added always-visible close button in the titlebar.
- Added visible edit project action in the titlebar.
- Kept reset/full-view controls in the titlebar.
- Added delegated close handling so close continues to work after rerenders.
- Added Escape-key close for the workbench.
- Did not change project assignment logic, overbooking logic, calendar data, Supabase, RLS, Edge Functions, login, or main.

Test:
- node --check app.js OK.

Manual test:
1. Open Project plan.
2. Click a project.
3. Confirm window opens small/floating.
4. Confirm X close button is visible in titlebar.
5. Click X and confirm workbench closes.
6. Open again and click Rediger prosjekt.
7. Confirm existing project edit modal opens.
8. Drag window and resize from edge/corner.
