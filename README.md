# Locked-v18.45c-employee-upcoming-projects-list-v1-safe

Base: `Locked-v18.45b-employee-project-details-v1-safe`.

## Endring
- Ansattportalen viser nå både `Neste prosjekt` og en egen liste med `Kommende prosjekter`.
- Listen viser alle fremtidige tildelinger registrert på den ansatte, uten en hard periodebegrensning.
- Første kommende tildeling vises fortsatt som hovedkortet `Neste prosjekt`.
- Øvrige kommende tildelinger vises med periode, prosjektkode/navn, rolle, kunde og prosjektleder når data finnes.

## Ikke endret
- Supabase/RLS
- tilgangssøknader/godkjenning
- brukerroller
- import
- prosjektplan
- bemanning/tildeling
- admin/planner/superadmin-flyt
- data.js

## Test
1. Logg inn som employee-testbruker.
2. Bekreft at nærmeste prosjekt vises som `Neste prosjekt`.
3. Bekreft at senere prosjekter vises under `Kommende prosjekter`.
4. Bekreft at planner/admin fortsatt viser alle ansatte/prosjekter i separat browser/profil.
