# PATCH HISTORY

## v18.62ab-project-workbench-core-staffing-controls

Basert på siste prosjektbemanningsarbeid fra v18.62u/v18.62aa.

Endringer:
- Prosjektbemanning behandles som nøkkelfunksjon.
- Tildelte ansatte får tydelige handlinger på samme linje: Endre og Fjern.
- Fjern gir raskere visuell respons og bruker eksisterende slettelogikk for planner_entries.
- Kandidatkort har tydelig + Legg til for ledige ansatte.
- Delvis/opptatt kan fortsatt åpnes for rolle/periode/overbook.
- Flere ansatte kan hukes av og legges til samlet via samme rolle/periode.
- Ved overbemanning får bruker bekreftelse i stedet for hard blokk.
- Overbooking er fortsatt mulig med bekreftelse og merkes i notat.
- Ingen endringer i Supabase schema, RLS, Edge Functions, login eller main.

Test før lock:
1. Login.
2. Åpne Prosjektplan og prosjektbemanning.
3. Legg til én ledig ansatt med + Legg til.
4. Huk av flere ansatte og legg til samlet.
5. Endre en tildeling fra Tildelte.
6. Fjern en tildeling fra Tildelte.
7. Sjekk at Ansattplan oppdateres.
