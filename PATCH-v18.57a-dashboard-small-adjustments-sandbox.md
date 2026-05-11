# v18.57a-dashboard-small-adjustments-sandbox

Sandbox patch basert på:

`Locked-v18.56d-calendar-click-guard-language-freeze-tested`

## Scope

Kun dashboard / Oppstart.

## Endringer

- Beholder dagens dashboard-struktur.
- Legger til ny KPI-seksjon: **Prosjekter neste 14 dager**.
- KPI-en viser:
  - totalt antall aktive prosjekter i perioden
  - fullbemannet
  - delvis bemannet
  - uten bemanning
  - må følges opp
- Oppdaterer “God morgen”-kortet med kort status om bemanningsoppfølging og fravær i dag.
- Korter ned tekst på toppknappene.
- Gjør toppknappene mørkere/integrert i dagens design.
- Fjerner unødvendig liten “periode”-tekst fra operativ status-kortene.

## Ikke endret

- Ingen Supabase-endringer.
- Ingen RLS-endringer.
- Ingen Edge Function-endringer.
- Ingen kalenderlogikk-endringer.
- Ingen importendringer.
- Ingen main/promotion-endring.

## Kontroll utført

- `node --check app.js` OK.

## Test før videre arbeid

Test i sandbox først. Main skal ikke røres før alle lenker/knapper i dagens løsning er gjennomgått.
