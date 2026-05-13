# PATCH_HISTORY

## v18.62ah-project-workbench-remove-response-optimization

Base: v18.62ag-project-workbench-simplified-staffing-flow-sandbox

Endringer:
- Optimaliserer respons når en tildelt ansatt fjernes fra prosjektbemanningsvinduet.
- Viser umiddelbart "Fjerner…" og demper raden før tyngre rendering starter.
- Oppdaterer prosjektvinduet først, og skyver kalender/dashboard/analyse-rendering til neste tick.
- Beholder eksisterende slettelogikk mot `planner_entries`.
- Ved feil i sletting rulles lokal state tilbake og appen rendres på nytt.

Ikke endret:
- Login
- Supabase schema
- RLS
- Edge Functions
- Kalenderdata-modell
- Overbookinglogikk
- Main
