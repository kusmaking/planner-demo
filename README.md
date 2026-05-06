# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.37g-import-worklist-full-width-preview-only-safe

## Base
Bygger fra:

- v18.37f-import-approval-list-preview-only-safe

## Formål
Forbedrer Prosjektimport-layouten slik at CSV-radene kan kontrolleres i en fullbredde arbeidsliste, i stedet for et lite scrollfelt inne i forhåndsvisningskortet.

## Endret

### Layout
Prosjektimport-siden har nå:

1. Last opp fil
2. Analyse / oppsummering
3. Importstatus

Under toppkortene brukes hele bredden til:

- Prosjekter fra CSV
- filterknapper
- stor arbeidsliste

### Arbeidsliste
Arbeidslisten viser:

- Velg
- Status
- Project Name
- Company
- Operation start
- Operation stop
- WS start
- WS stop
- Techs
- Kommentar

### Preview-redigering
Følgende felt kan justeres i preview:

- Operation start
- Operation stop
- WS start
- WS stop
- Techs

Endringer i preview oppdaterer status i skjermen.

### Filter
Arbeidslisten kan filtreres på:

- Alle
- Klar
- Datooppdatering
- Mangler dato
- Mangler techs
- WS-feil
- Ingen endring
- Ikke klar

## Viktig
Dette er fortsatt preview only.

Ingen data importeres.
Ingen data lagres.
Ingen Supabase-kall for import er lagt til.

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
- drag/resize
- workshop/feltlogikk

## Test

1. Login.
2. Åpne Prosjektimport.
3. Last opp CSV.
4. Sjekk at arbeidslisten vises i full bredde.
5. Filtrer mellom statusene.
6. Endre en dato eller Techs i listen.
7. Sjekk at status/valg oppdateres.
8. Bekreft at ingenting lagres.
