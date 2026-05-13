# Patch v18.62v — Fjern tildelte direkte fra prosjektvindu

Base: Locked-v18.62u-project-workbench-cleanup-approved

## Endret

- Gjør tildelte ressurser i prosjektbemanningsvinduet tydeligere handlingsbare.
- Bytter små ikonknapper i listen **Tildelte** til synlige knapper:
  - `Endre`
  - `Fjern`
- `Fjern` bruker eksisterende slettelogikk for `planner_entries`, med bekreftelse før sletting.
- Hindrer at klikk på Endre/Fjern bobler videre til vindu/kalender bak.
- Endringen gjelder prosjektvinduet, slik at man slipper å gå via Ansattplan for å fjerne en tildeling fra prosjekt.

## Ikke endret

- Ingen endring i Supabase schema.
- Ingen endring i RLS eller Edge Functions.
- Ingen endring i login.
- Ingen endring i kalenderdata/modell.
- Ingen endring i overbookinglogikk.
- Main er ikke rørt.

## Test

- `node --check app.js` OK.
- ZIP validert etter pakking.
