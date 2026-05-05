# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.37a-project-import-csv-preview-safe

## Base
Bygger fra låst sandbox-base:

- Locked-v18.36b-admin-screens-cleanup-safe

## Formål
Første trygge steg for prosjektimport.

Denne versjonen legger inn CSV-opplasting og preview/validering på Prosjektimport-siden, uten å lagre noe til Supabase.

## Endret

### Prosjektimport
Prosjektimport-siden har nå:

- lokal CSV-filopplasting fra PC
- lesing av CSV i nettleseren
- preview-tabell
- oppsummeringskort
- validering mot eksisterende prosjekter i appen

### CSV-mapping
Preview leser foreløpig disse kolonnene:

- Project Name
- Operation start
- Operation stop
- WS start
- WS stop
- Techs needed
- Company

### Datoer
CSV-datoer i formatet `DD.MM.YYYY` konverteres i preview til `YYYY-MM-DD`.

Mapping:

- Operation start -> prosjekt start / planned_start_date
- Operation stop -> prosjekt slutt / planned_end_date
- WS start -> workshop_start_date
- WS stop -> workshop_end_date

### Validering
Preview markerer:

- Ny
- Eksisterer
- Datoavvik
- Mangler dato
- Mangler navn

Match mot eksisterende prosjekter gjøres på:

- Project Name

Ved eksisterende prosjekt sammenlignes:

- Operation start mot planned_start_date
- Operation stop mot planned_end_date

## Viktig
Denne versjonen lagrer/importerer ikke data.

Det er bevisst. Først skal vi verifisere:

1. at CSV-en leses riktig
2. at kolonnene mappes riktig
3. at eksisterende prosjekter gjenkjennes
4. at datoavvik vises riktig

## Ikke endret

- Supabase
- database/datamodell
- RLS
- data.js
- prosjektdata/fritekst
- prosjektlogikk
- Prosjektplan
- Ansattplan
- drag/resize
- workshop/feltlogikk
- bemanningslogikk

## Testpunkter

1. Åpne Prosjektimport-fanen.
2. Last opp `Project General.csv`.
3. Sjekk at preview-tabellen vises.
4. Sjekk at antall rader stemmer.
5. Sjekk at Operation start/stop konverteres riktig.
6. Sjekk at prosjekter uten Operation start/stop merkes som Mangler dato.
7. Sjekk at eksisterende prosjekter vises som Eksisterer eller Datoavvik.
8. Bekreft at ingen data lagres.

## Neste steg etter godkjent preview

Neste naturlige versjon:

- v18.37b-project-import-preview-selection-safe

Mulig innhold:

- checkbox for hvilke prosjekter som kan importeres senere
- tydeligere filter for Ny / Eksisterer / Datoavvik / Mangler dato
- export av valideringsrapport
- deretter senere: faktisk import/lagring etter egen godkjenning
