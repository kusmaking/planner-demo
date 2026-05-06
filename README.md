# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.37j-import-workshop-only-fleet-delta-preview-safe

## Base
Bygger fra:

- v18.37i-import-worklist-norwegian-date-input-safe

## Formål
Gjør import-previewen mer egnet som synkroniseringsverktøy mellom prosjektstyringssystemet og planleggingssystemet.

## Endret

### Ny status
Lagt til status:

- Workshop-only

Brukes for Fleet/workshop-prosjekter som:
- har Fleet i Project Name
- mangler Operation start/stop
- har gyldig WS start/stop
- har Techs needed

Disse markeres som workshop-only og skal senere kunne opprettes med grønn workshopfase uten rød feltperiode.

### Tydelig handling per rad
Arbeidslisten viser nå handling:

- Create
- Update dates only
- Skip

Regel:
- Nye prosjekter = Create
- Workshop-only/Fleet = Create
- Eksisterende prosjekter med datoendring = Update dates only
- Eksisterende prosjekter uten endring = Skip
- Ikke-klare rader = Skip

### Sikker synkroniseringsregel
For eksisterende prosjekter skal CSV senere kun kunne oppdatere datoer:

- Operation start
- Operation stop
- WS start
- WS stop
- workshop_enabled

CSV skal ikke overskrive for eksisterende prosjekter:

- Techs needed
- notes
- Project Responsible
- Company
- Activity
- bemanning
- andre manuelle felt

### Techs
Techs vises fortsatt i arbeidslisten, men markeres som:

- brukes ved create
- endres ikke ved update

## Ikke endret

- Supabase
- database/datamodell
- RLS
- data.js
- index.html
- login/auth
- Ansattplan
- Prosjektplan
- faktisk import/lagring
- drag/resize
- workshop/feltlogikk

## Viktig
Dette er fortsatt preview only. Ingen data lagres eller importeres.

## Test

1. Login.
2. Åpne Prosjektimport.
3. Last opp CSV.
4. Sjekk filteret Workshop-only.
5. Sjekk at Fleet-prosjekter med WS-datoer og Techs vises som Workshop-only.
6. Sjekk at eksisterende prosjekter med datoendring viser Update dates only.
7. Sjekk at Techs viser at det ikke oppdateres på eksisterende prosjekter.
