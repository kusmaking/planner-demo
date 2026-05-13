# PATCH_HISTORY

## v18.63a-workshop-offshore-capacity-calculation-model-sandbox

Starter kapasitetskalkyle for dashboard.

Endret:
- Dashboardets kapasitetsanalyse bruker nå ressursbehov mot tilgjengelige ressurser for Offshore og Workshop.
- Offshore-kapasitet beregnes mot aktive offshore feltperioder og `headcount_required`.
- Workshop-kapasitet beregnes mot aktive workshop-/mobiliseringsperioder og `workshop_headcount_required`.
- Workshopressurser telles strengt som aktive ansatte med tittel som Onshore Workshop Technician / Workshop Technician eller Apprentice.
- Workshopressurser ekskluderer Management, 3. part / innleie, Lager/logistikk og Offshore.
- Kapasitet dag-for-dag viser netto kapasitet:
  - tilgjengelige ressurser minus gjenstående prosjektbehov
- Lav kapasitet-panelet viser kapasitetsgap/marginer for kommende uke.
- Eksisterende Engineering og 3 parts innleie vises fortsatt som tilgjengelighetsrader, ikke behovsberegning.

Ikke endret:
- Login
- Supabase schema
- RLS
- Edge Functions
- Prosjektbemanning / legg til / fjern ansatte
- Kalenderstruktur
- Main

## Base

Bygget fra:
Locked-v18.62ap-workshop-only-field-render-scroll-approved
