# Locked-v18.45e-employee-project-timeline-calendar-v1-safe

Base: `Locked-v18.45d-employee-select-upcoming-project-v1-safe`.

## Endring
- Ansattportalen har fått forbedret `Prosjektkalender`.
- Kalenderen viser nå alle kommende prosjekt-tildelinger for den ansatte i én tidslinje.
- Tidslinjen viser måned og uke, og skalerer etter alle kommende prosjekter uten hard periodebegrensning.
- Prosjektlinjene er klikkbare og bytter valgt prosjekt i detaljkortet øverst.
- Nærmeste kommende prosjekt er fortsatt standardvalgt.

## Ikke endret
- Supabase/RLS
- tilgangssøknader/godkjenning
- brukerroller
- import
- prosjektplan
- bemanning/tildeling
- admin/planner/superadmin-flyt
- data.js

## Test
1. Logg inn som employee-testbruker.
2. Bekreft at `Prosjektkalender` viser både TEST og senere juli-prosjekt på tidslinjen.
3. Trykk på prosjektlinjen i tidslinjen og bekreft at detaljkortet øverst bytter prosjekt.
4. Bekreft at `Kommende prosjekter` fortsatt fungerer og er klikkbar.
5. Test planner/admin i separat browser/profil og bekreft at alle ansatte/prosjekter fortsatt vises.

## v18.46 employee portal planner-frame + project timeline

Safe UI-only continuation from v18.45d/v18.45e employee portal work.

Changed:
- Employee portal now uses the same Izomax planner frame direction as the main planner:
  - same branded header/logo area
  - same dark planner background
  - same left-side rail feel
  - square/no-nonsense card styling aligned with planner UI
- Project calendar on employee page now renders all upcoming employee assignments as a real timeline by month/week.
- Timeline bars are clickable and update the selected project detail card.

Not changed:
- Supabase/RLS
- access request and approval flow
- user roles
- import logic
- project plan logic
- staffing/assignment logic
- planner/admin/superadmin flow
- data.js

Testing:
1. Test planner/admin in a separate browser/profile from employee.
2. Log in as employee and verify:
   - page uses Izomax planner-like frame/background/logo
   - next project still appears
   - upcoming projects list still appears
   - project timeline shows all upcoming assignments by month/week
   - clicking timeline/list rows changes the selected project card
3. Log in as planner/admin and verify all employees/projects still appear.

## v18.47 employee portal web redesign

- Web/desktop ansattportal er redesignet mot valgt mørk Izomax-dashboard mockup.
- Ansattportal har nå venstre profil-/neste-prosjekt-kolonne og hovedfelt med kommende kalender, kommende prosjekter og siste aktivitet.
- Mobile CSS er forbedret for stablet webvisning, men videre mobilpolish tas senere.
- Ikke endret: Supabase/RLS, tilgangsflyt, import, prosjektplan, bemanning eller admin/planner/superadmin-flyt.
