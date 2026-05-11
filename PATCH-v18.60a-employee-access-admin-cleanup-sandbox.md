# Patch v18.60a — Employee/access admin cleanup sandbox

Base: `planner-demo-v18.58b-access-request-existing-employee-link-guard-sandbox`

## Scope

This patch is a UI cleanup for the employee/admin area only.

## Changed

- Reworked `Ansatte` into a combined `Ansatte og tilganger` page.
- Added compact KPI cards for:
  - active employees
  - employees missing access
  - open access requests
  - possible duplicates
- Replaced long employee cards with a searchable/filterable employee register table.
- Added a right-side employee detail panel with:
  - profile summary
  - contact data
  - group/title/type
  - access status
  - role summary
  - upcoming plan entries
  - quick actions
- Moved `Brukertilganger` and `Tilgangssøknader` into the employee/admin page.
- Kept direct employee calendar blocks under an advanced/collapsible section.
- Left `Admin` as system status/log page only, with kanban, notification log and audit log preserved.

## Not changed

- No main branch changes.
- No Supabase schema changes.
- No RLS changes.
- No Edge Function changes.
- No calendar rendering changes.
- No planner_entries logic changes.
- No project/bemanning logic changes.
- No access approval backend changes.

## Validation

- `node --check app.js` OK.
