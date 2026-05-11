# Planner demo — v18.58a employee plan layout cleanup sandbox

Base:
`Locked-v18.57a-dashboard-small-adjustments-sandbox-approved`

This ZIP is a sandbox-only patch.

Main must not be updated until sandbox has been reviewed.

## Scope

Small visual cleanup for Ansattplan:

- slightly wider employee name column
- clearer employee names
- cleaner employee title/role line
- clearer employee group headers
- clearer group count pill
- same visual cleanup in year view rows

## Out of scope

No changes were made to:

- calendar logic
- project plan logic
- staffing logic
- Supabase
- RLS
- Edge Functions
- CSV import
- employee portal
- admin backend

## Validation

`node --check app.js` passed.

## Recommended sandbox test

Review Ansattplan first, then verify all existing links/buttons before any main merge is considered.

## v18.58b sandbox note
Denne ZIP-en inneholder dedup-guard for tilgangssøknader og bygger videre på v18.58a. Main skal ikke oppdateres før sandbox er testet.
