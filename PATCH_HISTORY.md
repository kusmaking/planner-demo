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

## v18.64a-employee-plan-layout-visibility-cleanup-sandbox

- Ryddet Ansattplan visuelt for å vise flere ansatte på skjermen.
- Redusert rad-/gruppehøyde og noe luft i venstre ansattkolonne.
- Gjort gruppeoverskrifter tydeligere med fargeindikator og kompaktere tellebrikke.
- Lagt inn små statusbrikker i ansattkolonnen for å skille Ledig/Opptatt i valgt visning.
- Forbedret lesbarhet på prosjektblokker i Ansattplan uten å endre kalenderdata, drag/drop, prosjektbemanning eller Supabase.



## v18.64b - Ansattplan density and block cleanup

- Fjernet Ledig/Opptatt-statusbrikker fra ansattkolonnen i Ansattplan.
- Gjorde ansattrader mer kompakte for å vise flere ansatte på skjermen.
- Lot prosjektblokker bruke mer av cellehøyden.
- Fjernet rolle-/stillingstekst inne i prosjektblokkene i Ansattplan for mindre visuell støy.
- Ikke endret drag/drop, kalenderdata, prosjektbemanning, Supabase, RLS, Edge Functions eller login.
