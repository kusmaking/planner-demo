# PATCH v18.62e — Project assignment popup workbench sandbox

Base: `v18.62d-project-panel-balanced-width-sandbox`

## Scope

Controlled UI/workflow adjustment for the Project Plan focus panel only.

## Changes

- Replaces the narrow/right project focus panel with a centered popup/workbench.
- Keeps the calendar visible behind the popup with existing project highlight/dimming behavior.
- Removes the dominant KPI card row from the project panel.
- Shows the essentials clearly:
  - project name
  - project owner
  - project type/status
  - period(s)
  - staffing need
  - assigned count
  - missing count
  - assigned employees
  - employees available for the full period
  - employees partly available
  - busy employees / overbooking candidates
- Busy/partly available candidates show conflict details where available, including project/activity and period.
- Employee assignment flow is simplified:
  - choose candidate
  - choose role
  - choose whole project period or custom partial period
  - add to project
- Overbooking remains allowed from the popup, but now shows a confirmation warning before saving.
- Overbooked entries are still marked with the note: `OVERBOOKET fra prosjektpanel - kontroller i Ansattplan`.

## Not changed

- No login changes.
- No Supabase schema changes.
- No RLS changes.
- No Edge Function changes.
- No calendar data model changes.
- No import changes.
- No main branch changes.

## Test checklist

1. Login.
2. Open Project Plan.
3. Click a project.
4. Confirm the popup opens instead of the side panel.
5. Confirm calendar remains visible behind the popup.
6. Confirm selected project remains highlighted and other projects are dimmed.
7. Confirm project name, owner, period(s), staffing need, assigned, and missing count are visible.
8. Confirm assigned employees show role and period.
9. Confirm available/partly available/busy columns show employees.
10. Select an available employee and add to project.
11. Select a partly available employee and add a custom partial period.
12. Select a busy employee, confirm overbooking warning, then verify conflict appears in Ansattplan.
13. Close popup and confirm calendar returns normally.
