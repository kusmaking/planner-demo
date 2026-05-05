v18.34d-profile-language-ui-match-startpage-safe

Utgangspunkt:
- v18.34c-profile-language-visual-indicator-safe

Formål:
- Gjøre språkfeltet i profil/login-menyen mer likt oppstartsskjermen.
- Tydeligere visning av hvilket språk som er valgt.

Endret:
- Språkfeltet i brukermenyen har nå mer lik struktur som oppstartsskjermen:
  - NO / EN-knapper
  - tydelig status til høyre for knappene
  - fortsatt linje under som viser valgt språk
- Aktivt språk vises nå mer eksplisitt:
  - Norsk valgt / English selected
- Ingen logikk utover språkvisning er endret.

Ikke endret:
- Supabase / database / RLS
- data.js
- prosjektlogikk
- prosjektplan
- modaler / tildeling
- workshop/feltlogikk
