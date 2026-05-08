# Locked-v18.52c-access-admin-cleanup-ui-safe

Ren UI-opprydding i Admin → tilgangskontroll.

## Endret
- Tilgangssøknader flyttet øverst i Admin-fanen og gitt tydeligere tittel: Tilgangskontroll.
- Fjernet interne scrollfelt fra tilgangssøknader og brukerliste slik at hele siden scroller normalt.
- Tydeligere handlingstekst for tilgangsoppsett.
- Søknader sorteres slik at ventende og ikke-ferdig oppsatte saker kommer øverst.
- Eksisterende brukere er flyttet under tilgangssøknader.
- Bedre knapper/spacing for Opprett Auth-bruker og Fullfør oppsett.

## Ikke endret
- Supabase/RLS
- Edge Function
- RPC-definisjoner
- Import
- Prosjektplan
- Bemanning/tildelingslogikk
- Ansattportal
- Planner/admin hovedfunksjoner
- data.js

## Test
1. Logg inn som superadmin.
2. Gå til Admin.
3. Bekreft at Tilgangskontroll/Tilgangssøknader ligger øverst.
4. Bekreft at du ikke må lete i flere interne scrollfelt.
5. Bekreft at ventende/godkjente ikke-ferdige søknader ligger øverst.
6. Test én eksisterende godkjent søknad og se at Opprett Auth-bruker / Fullfør oppsett fortsatt er synlig.
