# PATCH v18.62y — Project workbench assigned actions inline

Basert på v18.62x.

## Endret
- Flytter handlingene for tildelte ansatte direkte inn i tildelt-kortet.
- Knappene `Bytt / endre` og `Fjern` vises inline under rolle/periode.
- Knappene har inline fallback-styling slik at de ikke kan forsvinne pga. grid/kolonne/CSS-konflikt.
- Beholder eksisterende edit/delete-handlere og eksisterende slettelogikk.

## Ikke rørt
- Login
- Supabase/RLS/Edge Functions
- Kalenderstruktur
- Overbooking
- Main
