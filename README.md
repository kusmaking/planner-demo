# Locked v18.49 - employee project crew and open project v1 safe

Base: `Locked-v18.48-employee-calendar-layout-v1-safe`

## Endret
- `app.js`
- `index.html`
- `README.md`
- `SUPABASE_EMPLOYEE_CREW_RPC.sql` (må kjøres i Supabase før full crew-test)

## Ikke endret
- `data.js`
- Importlogikk
- Prosjektplan
- Bemanning/tildelingslogikk
- Admin/planner/superadmin-flyt
- Tilgangssøknader/godkjenning
- Eksisterende RLS-policyer

## Nytt i denne versjonen
- Employee-portalen kan vise crew på valgt prosjekt via trygg RPC.
- Bemanningsstatus vises med antall satt opp mot `headcount_required`.
- Viser om prosjektet mangler crew.
- `Åpne prosjekt` åpner nå en lesende prosjektinfo-visning i ansattportalen.
- Ingen redigering er tilgjengelig for employee.

## Supabase SQL som må kjøres
Kjør `SUPABASE_EMPLOYEE_CREW_RPC.sql` i Supabase SQL Editor før testing av crew.

RPC-en er laget slik at employee kun får crew for prosjekter der employee selv er tildelt.

## Langsiktig anbefaling
Dette er riktig retning: sensitive employee-oppslag bør samles i kontrollerte RPC-er/serverfunksjoner, ikke brede RLS-regler. Senere bør vi også flytte employee-dashboardets prosjekt-/kalenderdata til én samlet RPC for bedre sikkerhet, ytelse og enklere frontend.
