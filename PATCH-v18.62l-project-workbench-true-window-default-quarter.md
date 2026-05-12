# PATCH v18.62l — Project workbench true floating window default quarter

Mål:
- Fikse at prosjektvinduet åpnet som fullskjerm/over hele kalenderen.
- Gi prosjektvinduet Outlook-lignende oppførsel.
- Default størrelse ca. 1/4–1/3 av skjermen, slik at kalenderen fortsatt er synlig.
- Vinduet skal kunne flyttes fritt, endres i størrelse og lukkes tydelig.

Endringer:
- Default prosjektvindu er redusert til ca. 48% bredde og 54% høyde av viewport, med sikker min/max.
- Overstyrer gamle `inset/width/height: !important`-regler som låste vinduet til fullskjerm.
- Flytende vindu styres med inline `!important` for left/top/width/height slik at gammel CSS ikke tar over.
- Tydelig rød X beholdes øverst til høyre.
- `Lukk`-knapp i toppfelt og `Lukk vindu` nederst beholdes.
- Vinduet kan flyttes fra toppfeltet og endres i størrelse fra kanter/hjørner.
- Nullstilling setter vinduet tilbake til trygg standardstørrelse og plassering.
- Ryddet reset av inline-stiler når prosjektvinduet lukkes.

Ikke rørt:
- Login
- Supabase
- RLS
- Edge Functions
- Kalenderdata
- Tildelingslogikk
- Overbooking-logikk
- Import
- Main

Test:
- node --check app.js OK
