# v18.62f — Project workbench floating/resizable + tydelig lukking

Sandbox patch basert på `v18.62e-project-assignment-popup-workbench`.

## Endret

- Prosjektbemanning-popupen kan nå flyttes rundt på skjermen ved å dra i toppfeltet.
- Popupen kan endres i størrelse via resize-håndtak nederst til høyre.
- La til tydelig `Lukk`-knapp i toppfeltet.
- La til `Lukk vindu` nederst i popupen.
- La til `Nullstill vindu` for å gå tilbake til standard størrelse/plassering.
- Beholder kalenderen bak popupen med valgt prosjekt i fokus.

## Ikke endret

- Kalenderstruktur
- Kalenderdata
- Tildelingslogikk
- Overbooking-logikk
- Supabase schema
- RLS
- Edge Functions
- Login
- Main branch

## Test

- `node --check app.js` OK.
