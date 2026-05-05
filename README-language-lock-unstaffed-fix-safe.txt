v18.34b-language-lock-and-unstaffed-fix-safe

Utgangspunkt:
- v18.34a-language-employee-plan-safe

Formål:
- Fikse at språkvalg skal holde seg/låses etter NO/EN.
- Fikse at "Uten bemanning" følger valgt språk.

Endret:
- Språkvalg lagres fortsatt i localStorage og reappliseres når siden/app vises.
- Lagt inn språk-endringssignal slik at Ansattplan-kontroller oppdateres når NO/EN velges.
- Refresh av hurtigknapper bruker nå valgt språk direkte.
- "Uten bemanning" oversettes nå i hurtigknappen sammen med count.
- Tooltip for "Uten bemanning" oversettes også.
- Viser liten tekst "Språk låst" / "Language locked" på login-språkvalg for å tydeliggjøre at valget er lagret.

Ikke endret:
- Supabase / database / RLS
- data.js
- interne statusverdier og lagrede verdier
- prosjektlogikk
- prosjektplanmodul
- modaler/tildeling
- drag/resize/workshop/feltlogikk
