v18.33c-language-toggle-core-direct-safe

Utgangspunkt:
- Locked-v18.33-before-language-toggle

Hvorfor denne finnes:
- v18.33b reagerte ikke på språkknappene.
- Denne versjonen bruker direkte onclick + window.setIzomaxLanguage for NO/EN.
- Ingen automatisk DOM-scanning.
- Fortsatt kun kjerneoversettelse, ikke full app-oversettelse.

Endret:
- Språkvalg NO/EN på oppstartsside.
- Språkvalg NO/EN i brukermeny etter login.
- Direkte språkbytte for:
  - oppstart/login
  - app-title/subtitle
  - hovedfaner/tooltips
  - brukermeny
  - enkelte status-/loginmeldinger

Ikke endret:
- Supabase / database / RLS
- data.js
- interne statuser og lagrede verdier
- ansattplan/prosjektplan-logikk
- prosjektlogikk, drag/resize, workshop/felt
- modaler/tildelinger

Test:
1. Åpne sandbox logget ut.
2. Trykk EN på login-siden. Tekst skal endres umiddelbart.
3. Trykk NO. Tekst skal endres tilbake.
4. Logg inn.
5. Åpne brukermeny oppe til høyre og test NO/EN der.
