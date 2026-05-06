# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.40b-import-workshop-only-no-change-detection-safe

## Base
Bygger fra:
- v18.40a-import-selection-summary-and-row-status-safe

## Formål
Fikser preview/analyse for eksisterende Fleet/workshop-only-prosjekter.

Problemet:
- Fleet-prosjekter uten Operation start/stop, men med WS start/stop, ble vist som Datooppdatering hver gang CSV ble lastet opp på nytt.
- Dette skjedde selv når WS-datoene allerede var oppdatert i planner.

## Endret

### Workshop-only / Fleet no-change detection
For eksisterende Fleet/workshop-only-prosjekter sjekker systemet nå:

- WS start
- WS stop
- workshop_enabled

Regel:
- Hvis WS start/stop matcher planner: Ingen endring
- Hvis WS start/stop avviker: Datooppdatering

## Ikke endret

- Supabase schema
- RLS
- data.js
- importregler
- maks 10 handlingsbare rader
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
2. Finn Fleet/workshop-only-prosjektene som allerede er oppdatert.
3. Bekreft at de vises som Ingen endring når WS start/stop er lik planner.
4. Endre eventuelt WS-dato i CSV/preview og bekreft at de da vises som Datooppdatering.
