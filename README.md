# Locked v18.44c – employee assigned projects fetch fix

Base: Locked-v18.44b-employee-logout-fix-safe

## Endret
- `app.js`
- `README.md`

## Hva er fikset
- Employee/Min side henter nå bare data som employee-rollen skal bruke:
  - `planner_employees`
  - `planner_projects`
  - `planner_entries`
- Employee-flyt forsøker ikke lenger å hente audit-/notification-logg som kan være blokkert av RLS.
- Demo-seeding kjøres ikke for employee-brukere som mangler ordinær planner-data.

## Ikke endret
- `index.html`
- `data.js`
- Supabase-tabeller
- RLS policies
- import
- prosjektplan
- bemanning/tildeling
- tilgangssøknader
- brukerroller

## Test
1. Sørg for at RLS-policyene for employee-lesing av egen ansattprofil, egne/samme prosjekt-tildelinger og tildelte prosjekter er kjørt.
2. Sett testansatt på et prosjekt.
3. Logg inn som employee.
4. Min side skal vise neste prosjekt dersom tildelingen er lagret og prosjektet kan leses.
