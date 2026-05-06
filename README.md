# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.37f-import-approval-list-preview-only-safe

## Base
Bygger fra låst base:

- Locked-v18.37e-import-preview-state-safe

## Formål
Legger til en godkjenningsliste i CSV-forhåndsvisningen, fortsatt uten import eller lagring.

## Endret

### Prosjektimport / Forhåndsvisning
Preview viser nå mer presise statuskategorier:

- Ny – klar
- Eksisterer – ingen endring
- Eksisterer – datooppdatering
- Mangler operasjonsdato
- Mangler ressursbehov
- Workshop datoavvik
- Ikke klar

### Godkjenningsliste
Under forhåndsvisningen vises en liste:

- Klar for import / oppdatering

Listen inkluderer kun:

- Ny – klar
- Eksisterer – datooppdatering

Hver rad viser:

- checkbox
- prosjektnavn
- status
- operasjonsdatoer
- workshopdatoer
- Techs needed
- kort kommentar

Checkboxene er kun preview/valg i skjermbildet. De skriver ikke data.

## Viktige regler

Hvis Project Name finnes fra før:

- samme Operation start/stop og WS start/stop = Eksisterer – ingen endring
- nye Operation start/stop eller WS start/stop = Eksisterer – datooppdatering
- prosjektet skal ikke dupliseres

Hvis Project Name ikke finnes:

- gyldig Project Name + Operation start/stop + Techs needed = Ny – klar

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

## Test

1. Login.
2. Åpne Prosjektimport.
3. Last opp CSV.
4. Se oppsummering.
5. Se listen Klar for import / oppdatering.
6. Huk av/på noen rader.
7. Bekreft at ingenting lagres.
8. Bytt fane og tilbake, sjekk at preview fortsatt står.
