# v18.62g — Project workbench Outlook-window fix

Base: v18.62f project workbench floating/resizable close sandbox

## Mål
Gjør prosjektbemanning-popupen mer lik et Outlook-vindu:
- tydelig lukking
- flyttbart vindu
- justerbar størrelse
- ikke åpne som låst/fullscreen
- behold kalenderen synlig i bakgrunnen

## Endringer
- Lagt til tydelig Lukk-knapp i toppfeltet og footer.
- Flytting skjer via toppfeltet uten at vinduet maksimeres.
- Størrelse kan justeres via browser resize-hjørne nederst til høyre.
- Nullstill vindu går tilbake til standard størrelse/plassering.
- Vinduets posisjon og størrelse holdes innenfor skjermen.
- Popupen åpner som sentrert arbeidsvindu, ikke fullskjerm.

## Ikke endret
- Login
- Supabase
- RLS
- Edge Functions
- Kalenderstruktur
- Tildelingslogikk
- Overbooking-logikk
- Import
- Main

## Test
- node --check app.js
