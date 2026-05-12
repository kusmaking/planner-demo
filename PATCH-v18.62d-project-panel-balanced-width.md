# PATCH v18.62d — Project panel balanced width sandbox

Base: `v18.62c-project-panel-horizontal-expand-sandbox`

## Scope

Controlled visual adjustment for the project/focus panel only.

## Changes

- Reduces project/focus panel width by approximately 20% from v18.62c.
- Keeps the panel expanded horizontally compared with the old narrow panel, but avoids covering too much calendar.
- Keeps the calendar visible and more visually "in line" behind/around the panel.
- Keeps the existing project highlight / muted-background behavior.
- Keeps the green/yellow/red availability markers.
- Keeps overbooking allowed from the project panel.
- Adds no database, RLS, Edge Function, login, or calendar-data changes.

## Do not merge to main yet

Test in sandbox first:

1. Login.
2. Open Project Plan.
3. Click a project.
4. Confirm panel is smaller than v18.62c but still wider than the old version.
5. Confirm calendar remains visible and aligned behind/around the panel.
6. Confirm selected project remains highlighted and other projects muted.
7. Confirm add/overbook behavior still works if tested.
