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

## v18.62ac-project-workbench-core-staffing-ux-fix
- Gjør Legg til / Legg til valgte-knappen tydelig og synlig i prosjektbemanningsvinduet.
- Flytter bekreftelsesknappen ut av trang grid slik at den ikke forsvinner utenfor bredden.
- Beholder valg av én eller flere ansatte, rollevalg og hel/delperiode.
- Gjør kandidatkort mer eksplisitte med synlig legg-til-handling.
- Sikrer at Endre/Fjern på tildelte vises på samme rad.
- Ingen endringer i login, Supabase, RLS, Edge Functions eller main.

## v18.62ad-project-workbench-staffing-ux-cleanup
- Rydder bemanningsflyten i prosjektvinduet.
- Fjerner synlige avhukingsbokser som standard, slik at enkel tildeling skjer med én tydelig + Legg til-knapp.
- Legger flervalg bak en egen Velg flere-knapp for å unngå rot i normal arbeidsflyt.
- Viser kandidatnavn bedre, uten at navn kappes aggressivt.
- Holder Endre/Fjern på tildelte ansatte synlig på samme linje.
- Gir raskere visuell respons ved Legg til og Fjern.
- Reduserer tung full re-render etter add/remove i prosjektvinduet.
- Ingen endringer i Supabase schema, RLS, Edge Functions, login eller main.


## v18.62ae - Project workbench staffing card layout cleanup

- Ryddet kandidatkortene i prosjektbemanning.
- Forankret `+ Legg til` inne i hvert ansattkort, ikke i bakgrunnen.
- Fjernet dobbelt handling for ledige ansatte: ledig kort viser nå kun direkte `+ Legg til`.
- Delvis ledig/opptatt beholder valg for periode/overbook.
- Økte minimumsbredde på kandidatkort slik at navn/stilling ikke kappes like hardt.
- Ingen endring i login, Supabase, RLS, Edge Functions, kalenderdata eller main.
