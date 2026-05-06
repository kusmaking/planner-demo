# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.38b-import-default-deselected-safe

## Base
Bygger fra:

- v18.38a-import-selected-projects-test-mode-safe

## Formål
Gjør testimport tryggere mot live database ved å fjerne automatisk forhåndsvalg av rader.

## Endret

### Importvalg
Etter CSV-opplasting er ingen rader valgt som standard.

Bruker må aktivt huke av rader som skal importeres.

### Sikkerhet
- Ingen automatisk select all
- Maks 3 handlingsbare rader per import beholdes
- Skip/ikke-klare rader importeres fortsatt ikke
- Importknappen stopper hvis ingen rader er valgt

### UI-tekst
Arbeidslisten og importstatus informerer nå om at ingen rader velges automatisk.

## Ikke endret

- Supabase schema
- RLS
- data.js
- index.html
- importregler
- maks 3 test mode
- CSV_IMPORT_TEST-merking
- duplikatsikring
- Ansattplan
- Prosjektplan

## Test

1. Login.
2. Åpne Prosjektimport.
3. Last opp CSV.
4. Bekreft at ingen rader er huket av.
5. Huk av én rad manuelt.
6. Trykk Importer valgte test.
7. Bekreft at importdialogen kun gjelder den valgte raden.
