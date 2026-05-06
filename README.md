# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.39a-project-responsible-customer-fields-safe

## Base
Bygger fra:
- v18.38e-import-notes-project-responsible-only-safe

## Forutsetning i Supabase
Feltet er lagt til i public.planner_projects:

project_responsible text null

## Formål
Legger Prosjektleder og Kunde inn som tydelige prosjektfelt.

## Endret

### Prosjektmodal
- Obsolete Feltoppdrag-dropdown er skjult/fjernet fra brukerflyten.
- Nytt felt: Prosjektleder.
- Feltet Lokasjon/feltoppdrag er endret til Kunde.
- Prosjektkategori settes fortsatt fast til Offshore/Feltoppdrag internt.

### Prosjektkort / Prosjektoversikt
Prosjektkortet viser nå:
- Prosjektleder
- Kunde

### Supabase / prosjektdata
Appen leser og lagrer:
- project_responsible

### CSV-import
For nye prosjekter:
- Project Responsible fra CSV settes til project_responsible.
- Company fra CSV settes fortsatt til Kunde/location.

For eksisterende prosjekter:
- Import med Update dates only oppdaterer fortsatt kun datoer.
- Project Responsible og Kunde overskrives ikke på eksisterende prosjekter.

## Ikke endret
- RLS
- data.js
- importgrense maks 10
- default deselect
- duplikatsikring med IZO-kode
- Ansattplan
- Prosjektplan
- bemanning
- eksisterende prosjekters notes/Techs/Project Responsible/Kunde ved datooppdatering

## Test
1. Åpne et eksisterende prosjekt og sjekk at Prosjektleder-feltet finnes.
2. Legg inn Prosjektleder manuelt og lagre.
3. Åpne prosjektet igjen og sjekk at feltet står.
4. Last opp CSV og importer ett nytt prosjekt.
5. Bekreft at Project Responsible fra CSV havner i Prosjektleder.
6. Bekreft at Company fra CSV havner i Kunde.
7. Test Update dates only og bekreft at Prosjektleder/Kunde ikke overskrives.
