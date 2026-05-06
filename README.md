# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.39b-project-search-jump-to-project-period-safe

## Base
Bygger fra:
- v18.39a-project-responsible-customer-fields-safe

## Formål
Fikser at prosjekt-søk i Prosjektplan ikke viser prosjektet hvis brukeren står i feil periode.

## Endret

### Prosjektplan-søk
Når kalenderen står i Prosjektplan og brukeren søker etter et prosjekt, hopper kalenderen automatisk til prosjektets periode hvis prosjektet ligger utenfor synlig tidsperiode.

Eksempel:
- Søk på IZO-30208
- Hvis prosjektet finnes i oktober 2026, men kalenderen står i mai 2026, flyttes kalenderen til oktober 2026

### Dato som brukes for hopp
Systemet bruker første relevante prosjektperiode:
1. Workshop-periode hvis den er tidligst
2. Feltperiode
3. Planlagt start
4. Workshop start

### Søket inkluderer nå
- Project Name
- Project Code, f.eks. IZO-30208
- Kunde
- Prosjektleder
- Status
- Kategori

## Ikke endret
- Supabase schema
- RLS
- data.js
- importlogikk
- Ansattplan
- bemanning
- prosjektdata
- drag/resize

## Test
1. Gå til Prosjektplan.
2. Sett kalenderen til en periode der et kjent prosjekt ikke vises.
3. Søk på IZO-koden.
4. Bekreft at kalenderen hopper til perioden der prosjektet finnes.
5. Bekreft at prosjektet vises i listen.
