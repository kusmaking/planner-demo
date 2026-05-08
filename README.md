# Locked v18.49b - employee crew layout fix safe

Base: `Locked-v18.49-employee-project-crew-and-open-project-v1-safe`

## Endret
- `app.js`
- `index.html`
- `README.md`

## Ikke endret
- `data.js`
- Supabase/RLS
- RPC-definisjon
- Importlogikk
- Prosjektplan
- Bemanning/tildelingslogikk
- Admin/planner/superadmin-flyt
- Tilgangssøknader/godkjenning
- Brukerroller

## Fikset i denne versjonen
- Prosjektteam/Crew er flyttet ut av venstre sidepanel og inn i hovedfeltet under prosjektkalenderen.
- Crew-listen får bedre bredde, kontrast og lesbarhet.
- Viser hele crewet på valgt prosjekt, inkludert innlogget ansatt markert med `Deg`.
- Viser rolle og periode per crewmedlem.
- Bemanningsstatus er fortsatt synlig: f.eks. `2 / 2 satt opp`, `Fullt crew` eller `Mangler X`.

## Test
1. Logg inn som employee/testbruker.
2. Velg et prosjekt med flere crewmedlemmer.
3. Bekreft at `Prosjektteam` ligger i hovedfeltet, ikke klemt i venstre kolonne.
4. Bekreft at navn, rolle og periode er lesbart.
5. Test `Åpne prosjekt` og bekreft at prosjektinfo fortsatt åpnes.
6. Test planner i separat nettleser/profil og bekreft at admin/planner-visning fortsatt er urørt.

## Langsiktig anbefaling
På lang sikt bør employee-dashboardet samles i kontrollerte RPC-er/serverfunksjoner: profil, kommende prosjekter, kalender, crew og historikk. Det gir bedre sikkerhet, færre RLS-avhengigheter og mer stabil frontend. Denne patchen endrer kun layouten og holder eksisterende RPC/RLS uendret.
