# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.37d-project-import-inline-cards-safe

## Base
Bygget direkte fra fungerende sandbox-filene brukeren lastet opp etter rollback.

## Formål
Første nye, kontrollerte forsøk på prosjektimport etter rollback.

Denne versjonen legger CSV-preview inn i eksisterende Prosjektadmin/Prosjektimport-visning som tre enkle kort, uten stor tabell og uten lagring.

## Endret

### Prosjektimport
Prosjektfanen viser nå tre kort:

1. Last opp fil
   - CSV file input
   - status for valgt/lest fil
   - nullstill-knapp

2. Forhåndsvisning
   - total antall rader
   - nye prosjekter
   - eksisterende prosjekter
   - datoavvik
   - mangler dato/navn
   - korte eksempler, ikke stor tabell

3. Opprett prosjekter
   - deaktivert importknapp
   - tydelig beskjed om at import/lagring ikke er aktiv ennå

## CSV-mapping i preview
Preview leser foreløpig:

- Project Name
- Operation start
- Operation stop

Datoformat:
- DD.MM.YYYY konverteres til YYYY-MM-DD
- YYYY-MM-DD støttes også

Match mot eksisterende prosjekter:
- Project Name

Datoavvik:
- Operation start sammenlignes mot planned_start_date
- Operation stop sammenlignes mot planned_end_date

## Viktig
Denne versjonen lagrer ikke data og gjør ingen Supabase-kall for import.

## Ikke endret

- Supabase
- database/datamodell
- RLS
- data.js
- login/auth
- Ansattplan
- Prosjektplan
- prosjektdata/fritekst
- drag/resize
- workshop/feltlogikk
- bemanningslogikk

## Teknisk
Endringen er lagt i app.js og bruker eksisterende Prosjektadmin-tab som importområde.

Gammel prosjektadmin-render returnerer tidlig og viser importkort i stedet.
