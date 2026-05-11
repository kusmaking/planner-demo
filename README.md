# Locked v18.52d - access admin quick test UI

Base: Locked-v18.52c-access-admin-cleanup-ui-safe

Denne patchen er en hurtig UI-justering for å gjøre videre testing av tilgangsoppretting mer brukbar.

Endret:
- app.js
- README.md

Ikke endret:
- index.html
- data.js
- Supabase/RLS
- Edge Function
- RPC-definisjoner
- import
- prosjektplan
- bemanning/tildeling
- ansattportal
- planner/admin hovedfunksjoner

Endringer:
- Auth-bruker er løftet tydelig opp som eget første felt i oppsettet.
- `Opprett Auth-bruker` er gjort mer synlig.
- Sjekklisten er gjort mer nøytral med mindre pastellflater.
- Rekkefølgen Auth → rolle → ansatt → fullfør er tydeligere.

Formål:
- Gjøre det mulig å fullføre test av Edge Function/Auth-oppretting uten full redesign av tilgangskontrollsiden.

Langsiktig:
- Tilgangskontrollsiden bør senere redesignes mer grundig med egen arbeidskø, valgt søknadspanel, eksisterende brukere og historikk/logg nederst.
