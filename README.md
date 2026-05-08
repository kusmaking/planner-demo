# Locked-v18.50-access-setup-rpc-ui-v1-safe

Base: `Locked-v18.49b-employee-crew-layout-tested`

## Endret
- `app.js`
- `README.md`

## Ikke endret
- `index.html`
- `data.js`
- Supabase/RLS
- Import
- Prosjektplan
- Bemanning/tildelingslogikk
- Ansattportal/employee-dashboard
- Admin/planner/superadmin hovedflyt

## Nytt i v18.50
- Admin → Tilgangssøknader bruker nå RPC-funksjonen `admin_setup_access_request(...)` for å fullføre godkjente søknader.
- `Fullfør oppsett` kan nå opprette/oppdatere `user_profiles` automatisk når Supabase Auth-brukeren allerede finnes.
- UI viser tydeligere status for:
  - brukerprofil/Auth-status
  - valgt rolle
  - ansattprofilkobling
- Employee-søknader forsøker automatisk å foreslå ansattprofil basert på e-postmatch.
- Hvis Auth-brukeren mangler, vises tydelig feilmelding om at brukeren først må opprettes i Supabase Authentication.

## Viktig begrensning
Denne versjonen oppretter fortsatt ikke Supabase Auth-bruker automatisk. Det skal fortsatt gjøres manuelt i Supabase Authentication, eller senere via en trygg server-/Edge Function-løsning.

## Langsiktig anbefaling
På lang sikt bør hele tilgangsløpet håndteres via en sikker backend/Edge Function:
`godkjent søknad → inviter/opprett Auth-bruker → user_profile → rolle → ansattkobling → varsling`.
Service-role key skal ikke inn i frontend.
