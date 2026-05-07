# Locked-v18.44-approved-request-user-setup-v1-safe

Basert på `Locked-v18.43-access-management-tested`.

## Formål

Legger til første kontrollerte flyt for å gjøre en godkjent tilgangssøknad om til faktisk tilgangsoppsett.

Dette er fortsatt ikke full automatisk brukeroppretting.

## Endret

- Admin -> Tilgangssøknader viser nå når en godkjent søknad er klar for oppsett.
- For godkjente søknader vises knappen/området **Sett opp tilgang**.
- Superadmin/admin kan velge endelig rolle:
  - `employee`
  - `reader`
  - `planner`
  - `admin`
- Hvis rolle er `employee`, kan superadmin/admin koble søknaden til en eksisterende ansattprofil fra `planner_employees`.
- Ved lagring oppdateres eksisterende `user_profiles` for samme e-post:
  - `role`
  - `is_active = true`
  - `full_name`
  - `email`
  - `updated_at`
  - `updated_by`
- Ved employee-rolle oppdateres valgt `planner_employees.email` til søknadens e-post.
- Søknaden markeres som ferdig oppsatt med:
  - `setup_completed_at`
  - `setup_completed_by`
  - `approved_role`
  - `linked_employee_id`

## Ikke endret

- Oppretter ikke Supabase Auth-bruker automatisk.
- Legger ikke service-role key i frontend.
- Sletter ikke Auth-brukere.
- Endrer ikke importlogikk.
- Endrer ikke prosjektplan.
- Endrer ikke bemanning/tildeling.
- Endrer ikke eksisterende RLS på planner-tabeller.
- Endrer ikke ansattportal-logikk.
- Endrer ikke `data.js`.

## Viktig arbeidsflyt

Hvis en godkjent søknad mangler eksisterende brukerprofil, må superadmin først opprette brukeren i Supabase Authentication. Når profilen vises i **Brukertilganger**, kan søknaden settes opp fra Admin -> Tilgangssøknader.

## Test

1. Logg inn som superadmin.
2. Opprett en test-søknad via `Trenger tilgang?`.
3. Godkjenn søknaden i Admin -> Tilgangssøknader.
4. Opprett Auth-bruker manuelt i Supabase Authentication dersom brukerprofil ikke finnes.
5. Trykk `Oppdater` i Brukertilganger.
6. Gå tilbake til søknaden og bruk `Sett opp tilgang`.
7. Velg rolle.
8. Hvis rolle er `employee`, velg ansattprofil.
9. Trykk `Lagre tilgang`.
10. Kontroller i Supabase:

```sql
select full_name, email, requested_access, status, setup_completed_at, setup_completed_by, approved_role, linked_employee_id
from public.access_requests
order by created_at desc
limit 10;
```

og:

```sql
select email, full_name, role, is_active, updated_at, updated_by
from public.user_profiles
order by updated_at desc
limit 10;
```

Forventet:
- Søknaden har `setup_completed_at`.
- `approved_role` er satt.
- Brukeren i `user_profiles` er aktiv og har valgt rolle.
- Ved employee-rolle er ansattprofilen koblet via e-post.

---

# Izomax Personalplanlegger – historikk

## v18.43-access-management-v1-safe

Kontrollert tilgangsadministrasjon lagt til i Admin-fanen.

Endret:
- Admin -> Brukertilganger
- Superadmin kan aktivere/deaktivere eksisterende brukere i `public.user_profiles`
- Deaktivering setter kun `is_active = false`
- Aktivering setter `is_active = true`
- Egen innlogget superadmin-bruker kan ikke deaktiveres fra UI
- Inaktive brukere stoppes ved innlogging og sendes tilbake til startsiden med melding

Ikke endret:
- Supabase Auth-brukere slettes ikke
- Roller endres ikke
- Ansattkobling endres ikke
- CSV-import, prosjektplan, bemanning og ansattportal-logikk er ikke endret

## v18.42-access-approval-v1-safe

- Superadmin/admin får en seksjon i Admin-fanen: **Tilgangssøknader**.
- Listen henter rader fra `public.access_requests`.
- Søknader kan markeres som `approved` eller `rejected`.
- Ved behandling settes `reviewed_at`, `reviewed_by` og `review_note`.
- Det opprettes ikke Supabase Auth-bruker automatisk.
- Det endres ikke rolle i `user_profiles` automatisk.
- Det kobles ikke ansattprofil automatisk.

## v18.41-access-request-v1-safe

- Knappen `Trenger tilgang?` på oppstart/login åpner et søknadsskjema.
- Søknaden lagres i Supabase-tabellen `access_requests`.
- Søknaden får alltid status `pending` fra frontend.
- Ingen brukerrolle endres automatisk.
- Ingen ny tilgang gis automatisk.

## v18.40c-import-workshop-date-only-create-safe

- CSV-import med workshop-only-regel.
- Prosjekter med WS start/stop og uten Operation start/stop kan opprettes som Workshop-only.
- Senere feltperiode oppdaterer samme prosjekt uten duplikat.
- Import, prosjektplan, bemanning og eksisterende manuelle felt er beskyttet.

## v18.44b - employee logout fix

Kontrollert bugfix basert på v18.44:

- Koblet `Logg ut`-knappen i employee/Min side-visningen til samme logout-funksjon som resten av appen.
- Ingen endring i import, prosjektplan, bemanning, tilgangssøknader, roller eller Supabase Auth/RLS.
