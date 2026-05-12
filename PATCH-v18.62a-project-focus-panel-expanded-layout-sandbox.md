# PATCH v18.62a — Project focus panel expanded layout sandbox

Base:
- Locked-v18.61c-employee-access-filtered-ui-approved-sandbox

Scope:
- Prosjekt-/fokuspanel i Prosjektplan
- Visuell kalenderfokus når prosjektpanel er åpent

Endringer:
- Gjort prosjektpanelet større på desktop: ca. 48vw, maks 760px, min 560px.
- Beholder panelet som overlay slik at kalenderen fortsatt vises bak/ved siden av.
- Lagt inn KPI-rad i prosjektpanelet:
  - Behov
  - Tildelt
  - Mangler
  - Ledige hele perioden
  - Delvis ledige
- Tydeligere paneltittel: Bemanning og prosjektkontroll.
- Når prosjektpanelet er åpent i Prosjektplan, tones andre prosjektblokker ned visuelt.
- Valgt prosjekt fremheves tydeligere i kalenderen.

Ikke rørt:
- Login
- Supabase schema
- RLS
- Edge Functions
- Import
- Ansattplan-rendering
- Prosjekt-/kalenderdata
- Bemanningslagring
- Drag/drop-logikk
- Main

Test:
- node --check app.js: OK

Anbefalt test i sandbox:
1. Logg inn.
2. Åpne Prosjektplan.
3. Klikk på et prosjekt.
4. Sjekk at prosjektpanelet åpnes større.
5. Sjekk at valgt prosjekt fremheves og andre prosjekter tones ned.
6. Sjekk at kalenderen fortsatt kan ses bak/ved siden av panelet.
7. Sjekk at Rediger prosjekt fortsatt åpner modal.
8. Sjekk at Legg til prosjekt / Bemann fortsatt fungerer som før.
9. Lukk panelet og sjekk at kalenderen går tilbake til normal visning.
