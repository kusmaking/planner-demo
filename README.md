# Izomax Personalplanlegger – Sandbox changelog

## Base
Denne ZIP-en bygger videre på:

- v18.35e-language-modal-and-add-button-fix-safe

## Hovedstatus

Systemet har nå:

- Izomax oppstartsside før innlogging
- bakgrunnsbilde/watermark i appen
- språkvalg NO / EN
- språkvalg på oppstart/login
- språkvalg i brukermeny etter innlogging
- delvis språkstøtte for Ansattplan
- delvis språkstøtte for Prosjektplan
- delvis språkstøtte for prosjektpanelet
- utvidet språkstøtte for prosjektmodal / Edit project

## Viktige prinsipper

### Ikke endret
Følgende er bevisst ikke endret:

- Supabase
- database/datamodell
- RLS
- data.js
- interne statusverdier
- interne personalblokkverdier
- prosjektdata/fritekst
- prosjektlogikk
- drag/resize
- workshop/feltlogikk
- bemanningslogikk

### Viktig språkregel
Lagrede prosjektdata skal ikke oversettes automatisk.

Dette gjelder blant annet:

- prosjektnavn
- lokasjon
- notater
- prosjekttekst
- verdier skrevet inn av bruker
- prosjektkategori/verdi slik den er lagret

Kun faste UI-tekster oversettes.

## Hva som er forbedret i denne versjonen

### Prosjektmodal / Edit project
Mer av modalen er nå oversatt:

- Feltoppdrag / Field assignment
- Ressursbehov for selve prosjektperioden i felt / Resource need for the actual field period
- Lokasjon / feltoppdrag / Location / field assignment
- Behov for antall personer i felt / Required number of people in field
- Workshop / mobilisering / Workshop / mobilization
- Kan fjernes hvis prosjektet ikke trenger workshopforberedelse / Can be removed if the project does not need workshop preparation
- Legg til / Add
- Fjern / Remove
- Workshop start / Workshop start
- Workshop slutt / Workshop end
- Workshop ressursbehov / Workshop resource need
- standard hjelpetekst for workshop
- hjelpetekst for prosjektperioder

### Available-list i prosjektpanelet
Knappen til høyre er justert:

- viser nå Add / Selected tydeligere på engelsk
- større bredde
- bedre padding
- teksten skal ikke kuttes

## Språkstøtte som fungerer

### Oppstart/login
- Personalplanlegger / Personnel Planner
- Logg inn / Log in
- E-post / Email
- Passord / Password
- Glemt passord / Forgot password
- Trenger tilgang / Need access

### Hovedmeny
- Oppstart / Home
- Ansattplan / Employee plan
- Prosjektplan / Project plan
- Uten bemanning / Unstaffed
- Prosjektadmin / Project admin
- Ansattadmin / Employee admin
- Admin / Admin

### Ansattplan
Delvis oversatt:
- Søk ansatt / Search employee
- Uke / Måned / År
- Tilbake / I dag / Frem
- Panel
- Farger og status
- Direkte blokk på ansatt
- Notat
- Lagre blokk i kalender
- Kurs / Ferie / Syk / Avspasering / Travel som visningstekst

### Prosjektplan / prosjektpanel
Delvis oversatt:
- Prosjekt / Project
- Feltoppdrag / Field assignment
- Workshop / mobilisering / Workshop / mobilization
- behov / need
- Workshopbehov / Workshop need
- Ikke bemannet / Not staffed
- Delvis bemannet / Partly staffed
- Bemannet / Staffed
- Kansellert / Cancelled
- Tildelte / Assigned
- Bemanning / Staffing
- Bemann prosjekt / Staff project
- Perioder / Periods
- Rediger perioder / Edit periods
- Legg til ansatt / Add employee
- Available-list bruker Add / Selected på engelsk

## Områder som fortsatt bør tas videre modul for modul

Neste naturlige steg:

1. Fullføre resten av prosjektmodal / Edit project
   - resterende field labels
   - eventuelle feilmeldinger
   - flere workshop/periode-felter

2. Prosjektadmin
   - prosjektliste
   - valgt prosjekt
   - bemann prosjekt
   - tildelte ressurser
   - arkiv/fullførte prosjekter

3. Ansattadmin
   - ny ansatt
   - ansattfelter
   - grupper
   - aktiv/inaktiv
   - bulk-import

4. Dashboard
   - kapasitet
   - neste 14 dager
   - KPI-kort
   - lave kapasitetsdager

5. Admin/logg/systemstatus
   - varsellogg
   - endringslogg
   - systemstatus
   - standardmeldinger

## Testpunkter i sandbox

1. Test NO/EN på login.
2. Logg inn.
3. Test NO/EN i brukermenyen.
4. Test Ansattplan.
5. Test Prosjektplan.
6. Test Uten bemanning.
7. Åpne Edit project / Rediger prosjekt.
8. Sjekk at prosjektdata ikke oversettes automatisk.
9. Sjekk at Add/Selected vises riktig i available-listen.
10. Sjekk at Add-knappen er stor nok og viser hele teksten.
11. Sjekk at drag/resize, tildeling og workshop/feltlogikk fortsatt fungerer.

## GitHub/Vercel arbeidsflyt

- Videre utvikling skal skje i sandbox.
- Ikke push til main før sandbox er testet og godkjent.
- Ved stabil versjon bør sandbox låses/tagges før neste større endring.
- Main skal fortsatt være stabil production.
