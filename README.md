# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.37i-import-worklist-norwegian-date-input-safe

## Base
Bygger fra:

- v18.37h-import-worklist-responsible-clean-layout-safe

## Formål
Gjør datoene i import-arbeidslisten tydelige og redigerbare i norsk datoformat.

## Endret

### Arbeidsliste
Dato-feltene i importlisten er endret fra browser date-input til tekstfelt med norsk format.

Felt som påvirkes:
- Operation start
- Operation stop
- WS start
- WS stop

### Datoformat
Du kan skrive dato som:

- DDMMYY, eksempel: 170326
- DD.MM.YY, eksempel: 17.03.26
- DD.MM.YYYY, eksempel: 17.03.2026
- YYYY-MM-DD, eksempel: 2026-03-17

Datoene normaliseres internt tilbake til systemformatet YYYY-MM-DD for videre preview-analyse.

### Synlighet
- Datoene vises nå tydelig som DD.MM.YY i arbeidslisten.
- Techs-feltet er også gjort tydeligere.

## Ikke endret
- Supabase
- database/datamodell
- RLS
- data.js
- index.html
- login/auth
- Ansattplan
- Prosjektplan
- faktisk import/lagring
- Project Responsible-logikk

## Viktig
Dette er fortsatt preview only. Ingen data lagres eller importeres.
