# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.40c-import-workshop-date-only-create-safe

## Base
Bygger fra:
- v18.40b-import-workshop-only-no-change-detection-safe

## Formål
Gjør importanalysen bedre for prosjekter som kun har WS start/stop og ingen Operation start/stop.

Tidligere måtte prosjektet i praksis identifiseres som Fleet/workshop-only for å bli klar. Det er for snevert, fordi noen prosjekter kan være rene workshop-prosjekter uten at navnet inneholder Fleet.

## Endret

### Ny workshop-only-regel
Hvis en CSV-rad:
- har Project Name
- mangler Operation start/stop
- har WS start/stop

så klassifiseres den som:
- Workshop-only hvis prosjektet ikke finnes fra før
- Datooppdatering hvis eksisterende WS-datoer er annerledes
- Ingen endring hvis eksisterende WS-datoer matcher planner

Dette gjelder uavhengig av om prosjektnavnet inneholder Fleet.

### Senere feltperiode
Hvis samme prosjekt senere får Operation start/stop i CSV:
- samme IZO-kode matches
- eksisterende prosjekt oppdateres med feltperiode
- det opprettes ikke duplikat

## Ikke endret

- Supabase schema
- RLS
- data.js
- importgrense maks 10
- default deselect
- import selection summary
- row import status
- IZO-duplikatsikring
- Prosjektleder/Kunde-felt
- Prosjektplan
- Ansattplan
- bemanning

## Test

1. Last opp CSV.
2. Finn et prosjekt som kun har WS start/stop og ingen Operation start/stop.
3. Bekreft at det vises som Workshop-only hvis det ikke finnes fra før.
4. Importer ett slikt prosjekt.
5. Last opp CSV på nytt.
6. Bekreft at prosjektet vises som Ingen endring hvis WS-datoene matcher.
7. Hvis prosjektet senere får Operation start/stop, bekreft at det vises som Datooppdatering og ikke nytt prosjekt.
