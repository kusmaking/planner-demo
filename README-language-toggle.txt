v18.33a - språkvalg Norsk/English (sandbox)

Utgangspunkt:
- Locked-v18.33-before-language-toggle

Endring:
- Lagt til språkvalg NO / EN.
- Språkvalg vises på oppstart/login-siden.
- Språkvalg vises også i brukermenyen etter innlogging.
- Valgt språk lagres lokalt i nettleseren med localStorage.
- Første versjon oversetter synlige UI-tekster, menyer, knapper, faner, statusvisning, standard meldinger og placeholders via en språkordbok.

Bevisst ikke endret:
- Supabase / database / RLS
- Lagrede verdier i databasen
- Prosjektstatuser internt
- Personalblokker internt
- Prosjektlogikk, tildeling, drag/resize, workshop/feltlogikk
- data.js

Viktig:
- Interne verdier beholdes på norsk for å unngå å ødelegge eksisterende data og filtre.
- Dette er første kontrollert språkversjon. Noen dynamiske meldinger med prosjekt-/ansattnavn kan trenge finpuss etter sandbox-test.
