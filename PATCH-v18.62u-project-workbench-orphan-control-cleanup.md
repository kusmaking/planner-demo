# PATCH v18.62u — project workbench orphan control cleanup

Base: v18.62t-project-workbench-edit-design-cleanup-sandbox

## Endret

- Fjernet feilplassert prosjektvindukontroll fra konto-/profilområdet.
- Fjernet feilplasserte resize-handles fra toppområdet.
- Lagt inn guard som rydder bort prosjektvindu-kontroller dersom de ved et senere render havner utenfor `#calendarPanelCol`.

## Ikke endret

- Login
- Kalenderdata
- Prosjektbemanning
- Redigeringslogikk
- Tildeling/overbooking
- Supabase/RLS/Edge Functions
- Main

## Test

- `node --check app.js`
