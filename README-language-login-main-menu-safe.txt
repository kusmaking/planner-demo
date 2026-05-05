v18.33e-language-login-and-main-menu-safe

Utgangspunkt:
- v18.33d-startpage-language-index-only-test

Formål:
- Utvide den fungerende språkmetoden fra oppstartssiden til kjerneelementer etter login.

Endret:
- Språkvalg NO/EN fungerer fortsatt på oppstart/login-siden.
- Samme språkvalg er lagt inn i brukermenyen etter innlogging.
- Oversetter nå også:
  - appens hovedtittel/subtitle
  - venstre hovedmeny/tooltips:
    Oppstart/Home
    Ansattplan/Employee plan
    Prosjektplan/Project plan
    Uten bemanning/Unstaffed
    Prosjektadmin/Project admin
    Ansattadmin/Employee admin
    Admin/Admin
  - brukermeny:
    Språk/Language
    Endre passord/Change password
    Logg ut/Log out
- Språkvalg lagres i localStorage.

Bevisst ikke endret:
- Supabase / database / RLS
- data.js
- interne statuser og lagrede verdier
- kalenderlogikk
- prosjektlogikk
- ansattplan/prosjektplaninnhold
- modaler/tildeling
- drag/resize
- workshop/feltlogikk

Dette er fortsatt ikke full oversettelse av hele appen.
Neste steg bør være Ansattplan eller Prosjektplan, modul for modul.
