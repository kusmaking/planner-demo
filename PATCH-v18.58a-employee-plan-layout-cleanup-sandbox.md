# PATCH v18.58a — Employee plan layout cleanup sandbox

Base:

`Locked-v18.57a-dashboard-small-adjustments-sandbox-approved`

Purpose:

Small visual cleanup for Ansattplan only. This patch keeps the current design direction and makes the employee plan easier to scan without changing calendar, staffing, Supabase, RLS, import, or backend logic.

Changed:

- widened the sticky employee column slightly in Ansattplan day/week/month view
- made employee names more readable
- made employee titles/roles cleaner and less noisy
- added dedicated visual classes for employee group headers
- made group header count pills clearer
- applied the same visual treatment to year view group/name rows

Not changed:

- calendar date calculations
- entries / planner_entries logic
- drag/drop
- resize handles
- project blocks
- direct personal block flow
- Supabase
- Edge Functions
- RLS
- import
- dashboard logic
- project plan logic

Validation:

`node --check app.js` passed.

Recommended sandbox checks:

1. Open Ansattplan.
2. Test week/month/year view.
3. Expand/collapse employee groups.
4. Test group filter.
5. Open/click existing project blocks.
6. Right-click/left-click empty row area for direct block menu.
7. Drag an existing assignment if this is part of current workflow.
8. Confirm project plan still opens and looks unchanged.
9. Check browser console for errors.

Do not merge to main before sandbox review is complete.
