# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.40a-import-selection-summary-and-row-status-safe

## Base
Bygger fra låst base:
- Locked-v18.39b-clean-project-search-and-phase-filter-safe

## Formål
Gjør CSV-import tryggere og tydeligere før og etter import.

Problemet som løses:
- Det var vanskelig å se hvor mange prosjekter som var huket av før import.
- Valgte rader kunne ligge skjult i forskjellige filtre.
- Etter import kunne det se ut som prosjektet fortsatt ikke var importert, fordi raden lå igjen i listen uten tydelig status.

## Endret

### Valgt for import-oppsummering
Over arbeidslisten vises nå en egen boks:

- Valgt for import: X
- Create: X
- Workshop-only: X
- Update dates only: X
- Skip/ikke klar: X
- Liste med inntil 8 valgte prosjekter
- Tekst hvis flere er valgt

Dette gjør at brukeren kan kontrollere valgene før import.

### Etter import
Etter import settes status per rad i arbeidslisten:

- Opprettet
- Oppdatert
- Hoppet over
- Feil

### Valgte rader etter import
Vellykket importerte rader:
- fjernes automatisk fra valgt-listen
- checkbox deaktiveres i preview
- får grønn/tydelig importstatus

Dette reduserer risikoen for at samme rad importeres igjen ved et uhell.

### Siste importstatus
Over arbeidslisten vises siste importoppsummering:

- Opprettet
- Oppdatert
- Hoppet over
- Feil

## Ikke endret

- Supabase schema
- RLS
- data.js
- importregler
- maks 10 handlingsbare rader
- default deselect
- IZO-duplikatsikring
- Prosjektleder/Kunde-felt
- Prosjektplan
- Ansattplan
- bemanning

## Test

1. Last opp CSV.
2. Huk av prosjekter fra flere filtre/kategorier.
3. Bekreft at boksen "Valgt for import" viser riktig total og riktig fordeling.
4. Importer 1–3 rader først.
5. Bekreft at importerte rader får status Opprettet/Oppdatert.
6. Bekreft at vellykket importerte rader ikke lenger er huket av.
7. Bekreft at Siste importstatus viser riktig tall.
