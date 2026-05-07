# Locked-v18.48 employee portal calendar readability v1

Base: `Locked-v18.47-employee-portal-web-redesign-v1-safe`

## Endret
- `app.js`
- `index.html`
- `README.md`

## Ikke endret
- `data.js`
- Supabase/RLS
- tilgangssøknader/godkjenning
- brukerroller
- import
- prosjektplan
- bemanning/tildeling
- admin/planner/superadmin-flyt

## Hva som er forbedret
- Employee-portalen bruker mer av web-bredden.
- Prosjektkalenderen har bedre kontrast; ikke hvit tekst/felt på hvit bakgrunn.
- Prosjektkalenderen viser måned, uke og dag i headeren.
- Kalenderlinjene er fortsatt klikkbare og oppdaterer valgt prosjekt.
- Prosjektteam/Crew-kort ligger med i valgt prosjektvisning uten å endre RLS.

## Viktig
Crew vises bare hvis employee-visningen faktisk har tilgang til teamdata. Nåværende RLS er fortsatt smal og trygg. Eventuell bredere teamvisning bør tas som egen kontrollert RLS/RPC-endring senere.
