v18.33b-language-toggle-core-safe

Utgangspunkt:
- Locked-v18.33-before-language-toggle

Formål:
- Ny kontrollert språkstruktur for NO / EN uten treg automatisk DOM-oversettelse.

Endret:
- Lagt til språkvalg NO / EN på oppstart/login-siden.
- Lagt til språkvalg NO / EN i brukermenyen etter innlogging.
- Språkvalg lagres lokalt i nettleseren.
- Oversetter kun kjerneelementer i første runde:
  - oppstartsside/login
  - hovedtittel/subtitle
  - hovedfaner/tooltips
  - brukermeny
  - noen systemmeldinger/save-status

Bevisst ikke endret:
- Supabase / database / RLS
- data.js
- interne prosjektstatuser
- interne personalblokk-verdier
- prosjektlogikk
- ansattplan/prosjektplan-logikk
- drag/resize
- workshop/feltlogikk
- modaler og tildelinger

Viktig:
- Dette er ikke full oversettelse av hele systemet.
- Denne versjonen skal først teste at språkbytte er raskt og stabilt.
- Videre oversettelse bør tas modul for modul.
