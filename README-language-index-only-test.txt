v18.33d-startpage-language-index-only-test

Utgangspunkt:
- Locked-v18.33-before-language-toggle

Formål:
- Debug/test av språkknappene.
- Språkbytte på oppstart/login-siden er lagt direkte i index.html.
- app.js er ikke endret i denne versjonen.

Endret:
- NO/EN språkvalg på oppstartssiden.
- Direkte JavaScript i index.html for å bytte login/startside-tekst.
- Lagres fortsatt i localStorage.

Ikke endret:
- app.js
- data.js
- Supabase / database / RLS
- plannerfunksjoner
- ansattplan/prosjektplan/prosjektlogikk

Test:
1. Åpne sandbox logget ut.
2. Trykk EN på login-siden.
3. Startsideteksten skal endres med en gang.
4. Trykk NO, den skal endres tilbake.

Dette er kun test av språkknapp på oppstartsside, ikke full språkfunksjon.
