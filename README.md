# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.40c-import-workshop-date-only-create-safe

## Base
Bygger fra:
- v18.40b-import-workshop-only-no-change-detection-safe

## Formål
Gjør importanalysen bedre for prosjekter som kun har WS start/stop og ingen Operation start/stop.

Tidligere måtte prosjektet i praksis identifiseres som Fleet/workshop-only for å bli klar. Det er for snevert, fordi noen prosjekter kan være rene workshop-prosjekter uten at navnet inneholder Fleet.

## Endret

### Ny workshop-only-regel
Hvis en CSV-rad:
- har Project Name
- mangler Operation start/stop
- har WS start/stop

så klassifiseres den som:
- Workshop-only hvis prosjektet ikke finnes fra før
- Datooppdatering hvis eksisterende WS-datoer er annerledes
- Ingen endring hvis eksisterende WS-datoer matcher planner

Dette gjelder uavhengig av om prosjektnavnet inneholder Fleet.

### Senere feltperiode
Hvis samme prosjekt senere får Operation start/stop i CSV:
- samme IZO-kode matches
- eksisterende prosjekt oppdateres med feltperiode
- det opprettes ikke duplikat

## Ikke endret

- Supabase schema
- RLS
- data.js
- importgrense maks 10
- default deselect
- import selection summary
- row import status
- IZO-duplikatsikring
- Prosjektleder/Kunde-felt
- Prosjektplan
- Ansattplan
- bemanning

## Test

1. Last opp CSV.
2. Finn et prosjekt som kun har WS start/stop og ingen Operation start/stop.
3. Bekreft at det vises som Workshop-only hvis det ikke finnes fra før.
4. Importer ett slikt prosjekt.
5. Last opp CSV på nytt.
6. Bekreft at prosjektet vises som Ingen endring hvis WS-datoene matcher.
7. Hvis prosjektet senere får Operation start/stop, bekreft at det vises som Datooppdatering og ikke nytt prosjekt.


## v18.40c-employee-portal-v1

Denne pakken legger inn en separat ansattportal for brukere med rolle `employee`.

Scope:
- Planner/admin/superadmin skal fortsatt åpne dagens planlegger som før.
- Rollen `employee` åpner ny `Min side` / ansattprofil.
- Ansattprofilen er kun lesende.
- Ingen endring i CSV-import, prosjektplan, bemanning, Supabase-tabeller eller RLS.

Ansattprofilen viser:
- Neste prosjekt.
- Prosjektperiode.
- Rolle på prosjekt.
- Workshop/feltperiode.
- Prosjektkalender/tidslinje.
- Andre personer på samme prosjekt.
- Enkel prosjekthistorikk.

Testbruker:
1. Opprett bruker i Supabase Authentication.
2. Gi brukeren rolle `employee` i eksisterende profil-/rolleoppsett som `get_my_profile()` leser fra.
3. Sett samme e-postadresse på en eksisterende rad i `planner_employees.email`.
4. Legg denne ansatte på et prosjekt i dagens planner/admin-visning.
5. Logg inn med testbrukeren. Brukeren skal da lande på ansattportalen, ikke full planner.

Merk:
- Denne versjonen bruker e-postmatch mellom innlogget bruker og `planner_employees.email`.
- Hvis e-post ikke matcher en ansatt, vises en trygg melding om at ansattprofil ikke er koblet.
- En mer robust senere løsning kan være `planner_employees.user_id = auth.users.id`, men det krever egen Supabase/RLS-runde.

## v18.41-access-request-v1-safe

Denne pakken legger inn første kontrollerte del av tilgangsflyten.

Scope:
- Knappen `Trenger tilgang?` på oppstart/login åpner et søknadsskjema.
- Søknaden lagres i ny Supabase-tabell `access_requests`.
- Brukeren får bekreftelse når søknaden er sendt.
- Søknaden får alltid status `pending` fra frontend.

Ikke endret:
- Planner/admin/superadmin-flyt.
- Ansattportal-logikk.
- CSV-import.
- Prosjektplan.
- Bemanning/tildeling.
- Eksisterende tabeller og eksisterende RLS.
- Automatisk rolleendring eller automatisk tilgangsgodkjenning.

Forutsetning i Supabase:
- Tabellen `public.access_requests` må være opprettet.
- RLS må være aktivert.
- Insert-policy for `anon, authenticated` må tillate nye rader med `status = 'pending'`.
- Select/update-policy for admin/superadmin er klargjort for neste steg.

Test:
1. Åpne login-siden.
2. Trykk `Trenger tilgang?`.
3. Fyll ut navn, e-post og ønsket tilgang.
4. Trykk `Send søknad`.
5. Sjekk i Supabase:

```sql
select full_name, email, requested_access, status, created_at
from public.access_requests
order by created_at desc
limit 10;
```

Forventet:
- Ny rad med `status = pending`.
- Ingen brukerrolle endres.
- Ingen ny tilgang gis automatisk.
