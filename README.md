# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.38a-import-selected-projects-test-mode-safe

## Base
Bygger fra låst base:

- Locked-v18.37j-import-workshop-only-fleet-delta-preview-safe

## Formål
Første ekte importversjon, men kun i begrenset test mode fordi sandbox og main bruker samme live Supabase-database.

## Viktig
Dette skriver til live database når importknappen brukes.

Derfor er importen strengt begrenset.

## Endret

### Importknapp
Lagt til knapp i Prosjektimport:

- Importer valgte test

### Test mode-begrensning
Import tillater maks 3 valgte, handlingsbare rader per kjøring.

Hvis flere enn 3 handlingsbare rader er valgt, stoppes importen.

### Kun valgte rader
Import bruker bare rader som er huket av i arbeidslisten.

### Skip ignoreres
Rader med handling/status som ikke er handlingsbare importeres ikke.

### Nye prosjekter
For nye prosjekter:
- opprettes som nye planner-prosjekter
- får Project Name
- får Operation start/stop
- får WS start/stop hvis finnes
- får Techs needed
- får Project Responsible, Company, Activity, Link osv. lagt i notes
- notes merkes med CSV_IMPORT_TEST

### Workshop-only / Fleet
For Workshop-only:
- opprettes med status Avventer
- får ingen rød feltperiode
- får grønn workshopperiode fra WS start/stop
- Techs brukes som workshopressursbehov
- notes merkes med CSV_IMPORT_TEST

### Eksisterende prosjekter
For Update dates only:
- oppdaterer kun datoer
- Operation start
- Operation stop
- WS start
- WS stop
- workshop_enabled

Importen endrer IKKE:
- Techs
- notes
- Project Responsible
- Company
- Activity
- bemanning
- status
- manuelle felt

### Duplikatsikring
Hvis Project Name finnes fra før, opprettes ikke nytt prosjekt med samme navn.

## Ikke endret
- Supabase schema
- RLS
- data.js
- index.html
- Ansattplan
- Prosjektplan
- bemanningslogikk
- datamodell

## Testanbefaling
Første test:
1. Velg kun 1 nytt, ufarlig prosjekt.
2. Trykk Importer valgte test.
3. Bekreft dialogen.
4. Sjekk at prosjektet opprettes.
5. Sjekk notes for CSV_IMPORT_TEST.
6. Sjekk at ingen duplikater opprettes.

Andre test:
1. Velg kun 1 eksisterende prosjekt med datooppdatering.
2. Bekreft at kun datoene endres.
3. Bekreft at Techs/notes/bemanning ikke endres.
