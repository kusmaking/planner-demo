# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.37e-keep-import-preview-state-safe

## Base
Bygget fra fungerende sandbox-base der upload-kortet vises og login fungerer.

## Formål
Fikser at CSV-forhåndsvisning/oppsummering forsvinner etter kort tid når appen re-render.

## Endret
Preview-resultatet lagres nå midlertidig i app-state:

- filnavn/status
- antall rader
- total
- ny
- eksisterer
- datoavvik
- mangler dato/navn
- korte eksempler

Når Prosjektimport-siden tegnes på nytt, brukes lagret state til å vise samme preview-oppsummering igjen.

## Ikke endret
- Supabase
- database/datamodell
- RLS
- data.js
- index.html
- login/auth
- Prosjektplan
- Ansattplan
- prosjektdata/fritekst
- drag/resize
- workshop/feltlogikk
- faktisk import/lagring

## Viktig
Dette er fortsatt kun preview. Ingen data importeres eller lagres.

## Test
1. Login.
2. Åpne Prosjektimport.
3. Last opp CSV.
4. Se at forhåndsvisning/oppsummering kommer frem.
5. Vent noen sekunder.
6. Bytt gjerne fane og tilbake.
7. Sjekk at forhåndsvisningen ikke forsvinner.
