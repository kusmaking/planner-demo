# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.38d-import-duplicate-match-project-code-safe

## Base
Bygger fra:

- v18.38c-import-batch-notes-confirmation-safe

## Formål
Fikser svakhet i duplikatsjekk ved import.

Tidligere ble duplikater kun sjekket på full Project Name. Hvis prosjektteksten var litt forskjellig, kunne samme IZO-prosjekt opprettes som duplikat.

## Endret

### Prosjektkode-match
Import-preview og import bruker nå prosjektkode som primær match:

- IZO-30109
- IZO-30235
- osv.

Hvis både CSV-rad og eksisterende prosjekt har samme IZO-kode, behandles de som samme prosjekt selv om navnet ellers er forskjellig.

Eksempel som nå fanges:
- IZO-30109 03CL150 Oseberg Sør Sjøvannstre...
- IZO-30109 03CL150 Oseberg

Disse regnes nå som samme prosjekt.

### Match-rekkefølge
1. Match på IZO-prosjektkode
2. Hvis ingen kode finnes: match på normalisert full Project Name

### Preview
Arbeidslisten viser nå prosjektkode under Project Name når kode finnes.

Hvis raden er matchet på kode, vises:
- Matchet på kode

### Import
Create blokkeres dersom samme IZO-kode finnes fra før.

Det skal ikke opprettes nytt prosjekt når prosjektkode allerede finnes i planner.

## Ikke endret

- Supabase schema
- RLS
- data.js
- index.html
- importgrense
- default deselect
- CSV_IMPORT notes
- eksisterende prosjekter oppdaterer fortsatt kun datoer
- Ansattplan
- Prosjektplan

## Test

1. Last opp CSV.
2. Finn et prosjekt der eksisterende planner-navn og CSV-navn er litt ulike, men har samme IZO-kode.
3. Bekreft at raden ikke vises som nytt prosjekt.
4. Bekreft at den vises som eksisterende/datooppdatering eller ingen endring.
5. Kjør ikke import før du har bekreftet at IZO-kode-match ser riktig ut.
