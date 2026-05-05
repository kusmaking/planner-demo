# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.37b-project-import-csv-preview-visible-safe

## Base
Bygger videre på:

- v18.37a-project-import-csv-preview-safe
- med robust synliggjøring av Prosjektimport-siden

## Formål
Forrige versjon kunne fremstå uten synlig endring i sandbox fordi Prosjektimport-UI lå for mye bak JavaScript-rendering.

Denne versjonen gjør Prosjektimport synlig mer robust ved å legge import-UI direkte inn i `index.html`, i tillegg til JavaScript-funksjonene.

## Endret

### Prosjektimport
Prosjektimport-siden viser nå direkte:

- Velg CSV-fil
- Nullstill preview
- statusfelt
- oppsummeringskort
- preview-tabell

### CSV-preview
CSV-preview gjør fortsatt:

- leser CSV lokalt i nettleseren
- lagrer ingenting
- mapper Project Name, Operation start/stop, WS start/stop, Techs needed og Company
- konverterer dato `DD.MM.YYYY` til `YYYY-MM-DD`
- matcher mot eksisterende prosjekter på Project Name
- viser Ny / Eksisterer / Datoavvik / Mangler dato / Mangler navn

## Ikke endret

- Supabase
- database/datamodell
- RLS
- data.js
- Prosjektplan
- Ansattplan
- prosjektlogikk
- drag/resize
- workshop/feltlogikk
- bemanningslogikk

## Testpunkter

1. Last opp i sandbox.
2. Gå til Prosjektimport/Prosjektadmin-fanen i venstremenyen.
3. Bekreft at CSV-opplastingen vises.
4. Last opp `Project General.csv`.
5. Sjekk at preview-tabell og oppsummering vises.
6. Bekreft at ingen data lagres.
