# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.38c-import-batch-notes-confirmation-safe

## Base
Bygger fra låst base:

- Locked-v18.38b-import-default-deselected-safe

## Formål
Åpner forsiktig for større import og gjør importmeldinger/notes tydeligere for sluttbruker.

## Endret

### Importgrense
Importgrensen er økt fra maks 3 til maks 10 handlingsbare rader per import.

Dette er fortsatt en sikker begrensning fordi sandbox og main bruker samme live database.

### Default valg
Ingen rader er valgt som standard.

Bruker må fortsatt aktivt huke av rader før import.

### Bekreftelse før import
Bekreftelsesdialogen er gjort tydeligere:

- varsler at import skriver til live database
- viser antall nye feltprosjekter
- viser antall workshop-only/Fleet-prosjekter
- viser antall datooppdateringer
- viser antall Skip/ikke-klare rader
- viser navn på prosjekter i hver kategori
- viser sikkerhetsregler før import

### Resultat etter import
Resultatdialogen er gjort tydeligere:

- opprettet
- oppdatert
- hoppet over
- feil
- navn på berørte prosjekter

### Notes på nye prosjekter
Nye prosjekter får bedre notes med:

- CSV_IMPORT
- Source: Project General CSV
- Imported at
- Imported by
- Import action
- Project type
- Project Name
- Operation start/stop
- WS start/stop
- Techs needed
- Project Responsible
- Company
- Activity
- Responsible eng.
- Responsible procurement
- BOM status
- AOGV Tool Register
- Link
- Import safety-tekst

### Eksisterende prosjekter
Eksisterende prosjekter oppdateres fortsatt kun med datoer.

Import endrer fortsatt IKKE på eksisterende prosjekter:

- Techs
- notes
- Project Responsible
- Company
- Activity
- bemanning
- status
- andre manuelle felt

## Ikke endret

- Supabase schema
- RLS
- data.js
- index.html
- Ansattplan
- Prosjektplan
- datamodell
- duplikatsikring
- default deselect

## Testanbefaling

1. Last opp CSV.
2. Velg 2–5 rader manuelt.
3. Trykk Importer valgte.
4. Les bekreftelsesdialogen nøye.
5. Importer.
6. Sjekk notes på nye prosjekter.
7. Sjekk at eksisterende prosjekter kun får datoer oppdatert.
8. Ikke kjør større batch før dette er verifisert.
