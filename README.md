# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.37c-project-import-csv-preview-cachebust-safe

## Hvorfor denne finnes
v18.37b kunne fortsatt vise gammel Prosjektimport-placeholder i sandbox. Dette tyder på at gammel app.js kunne bli cachet eller at gammel render fortsatt ble brukt.

## Endret
- Prosjektimport-UI ligger fortsatt direkte i index.html.
- Prosjektimport-UI ligger også i app.js-renderen.
- Gamle placeholder-tekster er fjernet.
- Lagt inn tydelig versjonsmerke: CSV preview v18.37c.
- Lagt til cache-busting i script tags:
  - data.js?v=18.37c
  - app.js?v=18.37c
- Opplastingsfeltet er gjort mer tydelig:
  - ⬆ Velg CSV-fil for preview

## Funksjon
Prosjektimport-siden skal nå vise:
- CSV-opplasting
- Nullstill preview
- statusfelt
- oppsummeringskort
- preview-tabell

## Ikke endret
- Supabase
- database/datamodell
- RLS
- data.js-innhold
- Prosjektplan
- Ansattplan
- prosjektlogikk
- drag/resize
- workshop/feltlogikk

## Test
Etter deploy i sandbox:
1. Hard refresh nettleseren.
2. Åpne Prosjektimport-fanen.
3. Se etter merket CSV preview v18.37c.
4. Se etter feltet ⬆ Velg CSV-fil for preview.
5. Last opp Project General.csv.
