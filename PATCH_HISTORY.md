# Patch history

## v18.63d-dashboard-resource-priority-layout-cleanup

- Ryddet dashboard slik at Offshore bemanning og Verkstedkapasitet kommer høyere på skjermen.
- Fjernet toppkortene for Ansattplan/Prosjektplan/Uten bemanning/Prosjektadmin/Ansattadmin fra dashboardet, siden disse finnes i venstremenyen.
- Fjernet stor KPI-boks for Prosjekter neste 14 dager fra dashboardet.
- Fjernet egen topp-KPI-rad for Tilgjengelige ressurser/Totalt behov/Kapasitetsgap/Kritiske dager/Toppbelastning, siden nøkkeltallene nå ligger inne i Offshore/Verksted-kortene.
- Gjort Operativ status mindre og mindre dominerende.
- Beholdt eksisterende offshore-/workshop-kalkyle fra v18.63b/c.
- Ikke endret login, prosjektbemanning, kalenderdata, Supabase, RLS, Edge Functions eller main.

## Tidligere viktig base

- Bygger videre på Locked-v18.62ap-workshop-only-field-render-scroll-approved og v18.63c-resource-planning-dashboard.
