# Locked-v18.51-access-setup-checklist-ui-v1-safe

Base: `Locked-v18.50-access-setup-rpc-tested`

## Endret
- `app.js`
- `README.md`

## Ikke endret
- `index.html`
- `data.js`
- Supabase/RLS
- RPC-definisjoner
- Import
- Prosjektplan
- Bemanning/tildelingslogikk
- Ansattportal/employee-dashboard
- Admin/planner/superadmin hovedflyt

## Nytt i v18.51
- Admin → Tilgangssøknader har nå en tydeligere sjekkliste for godkjente søknader.
- Sjekklisten viser:
  - Søknad: godkjent / ikke godkjent
  - Auth / brukerprofil: finnes / mangler
  - Rolle: valgt rolle
  - Ansattprofil: klar / mangler / ikke relevant
  - Klar til fullføring: ja / nei
- Fullfør oppsett-knappen og hjelpeteksten er tydeligere.
- UI forklarer riktig rekkefølge:
  1. Opprett Auth-bruker i Supabase Authentication ved behov.
  2. Velg rolle.
  3. Koble ansattprofil hvis rollen er Ansatt / Min side.
  4. Trykk Fullfør oppsett.

## Viktig begrensning
Denne versjonen oppretter fortsatt ikke Supabase Auth-bruker automatisk. Det skal fortsatt gjøres manuelt i Supabase Authentication, eller senere via en trygg server-/Edge Function-løsning.

## Langsiktig anbefaling
På lang sikt bør hele tilgangsløpet håndteres via en sikker backend/Edge Function:
`godkjent søknad → inviter/opprett Auth-bruker → user_profile → rolle → ansattkobling → varsling`.
Service-role key skal ikke inn i frontend.
