# v18.61c — Employee card access filtered to selected employee

Base: `v18.61b-employee-card-access-controls-sandbox`

Scope: `Ansatte og tilganger` UI only.

## Endring

- Knappen `Tilganger` på valgt ansattkort åpner fortsatt tilgangspanelet, men panelet viser nå kun:
  - brukertilgang for valgt ansatt
  - tilgangssøknader som matcher valgt ansatt på navn, e-post eller telefon
- Full bruker-/søknadsliste vises ikke når panelet åpnes fra ansattkortet.
- Overskriften i tilgangspanelet viser hvilken ansatt som er i fokus.
- Hvis panelet er åpent og man velger en annen ansatt, oppdateres panelet til ny valgt ansatt.

## Ikke rørt

- Login
- Supabase schema
- RLS
- Edge Functions
- Auth-flyt
- Kalender
- Prosjektplan
- Bemanning
- Import
- Main

## Test

- `node --check app.js` OK
