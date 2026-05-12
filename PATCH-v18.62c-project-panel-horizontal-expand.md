# PATCH v18.62c — Project panel horizontal expansion sandbox

Base: `v18.62b-project-panel-wider-overbook-capacity-ui-sandbox`

## Scope

Controlled UI adjustment for the project/focus panel only.

## Changes

- Makes the project/focus panel significantly wider horizontally on desktop.
- Expands the panel toward the left side of the screen instead of increasing vertical height.
- Keeps the calendar visible behind/around the panel.
- Preserves the existing project highlight / muted-background behavior.
- Keeps the existing green/yellow/red availability markers.
- Keeps overbooking allowed from the project panel.
- Adds no database, RLS, Edge Function, login, or calendar-data changes.

## Do not merge to main yet

Test in sandbox first:

1. Login.
2. Open Project Plan.
3. Click a project.
4. Confirm the panel is wider horizontally and uses more of the right side.
5. Confirm the calendar structure is not broken.
6. Confirm selected project remains highlighted and other projects muted.
7. Add available, partial, and busy/overbooked employee if needed.
8. Confirm overbooking is still marked in employee plan.
