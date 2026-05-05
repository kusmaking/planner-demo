v18.34a-language-employee-plan-safe

Utgangspunkt:
- Locked sandbox etter v18.33e-language-login-and-main-menu-safe

Formål:
- Utvide fungerende språkmetode til Ansattplan-relaterte UI-elementer, uten å oversette hele appen.

Endret:
- NO/EN påvirker nå mer av Ansattplan:
  - Søk ansatt / Search employee
  - Uke / Måned / År
  - Ansattplan / Prosjektplan / Uten bemanning hurtigknapper
  - Tilbake / I dag / Frem
  - hjelpetekst over kalender
  - Panel
  - Farger og status
  - legend/fargeforklaring for Feltoppdrag, Workshop/mobilisering og personlige blokker
  - Direkte blokk på ansatt
  - forklaringstekst for direkte blokk
  - Notat placeholder
  - Lagre blokk i kalender

Bevisst ikke endret:
- Supabase / database / RLS
- data.js
- interne statusverdier
- interne personalblokk-verdier
- prosjektlogikk
- prosjektplanmodul
- prosjektmodaler
- bemanning/tildeling/drag/resize/workshop/feltlogikk

Viktig:
- Interne verdier holdes fortsatt på norsk.
- Oversettelsen er visningstekst, ikke datamigrering.
- Dette er fortsatt modulbasert språkstøtte, ikke full systemoversettelse.
