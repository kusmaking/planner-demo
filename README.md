# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.39b-clean-project-search-and-phase-filter-safe

## Base
Bygger fra:
- v18.39a-project-responsible-customer-fields-safe

## Formål
Ren videreføring fra stabil v18.39a, uten å bygge videre på de forkastede søkefixene v18.39b/c/d.

Denne versjonen gjør to ting:
1. Legger inn ren prosjekt-søkeflyt.
2. Endrer prosjekt-dropdown fra kategori-filter til fasefilter.

## Endret

### Prosjekt-søk
Når du står i Prosjektplan:
- søk kan finne prosjekt på prosjektnavn
- IZO-kode
- Kunde
- Prosjektleder
- status/kategori

Hvis prosjektet ligger utenfor synlig periode:
- kalenderen hopper til prosjektets periode
- perioden du stod i før søket lagres

Når søket tømmes:
- søket nullstilles
- prosjektfokus/panel/spotlight nullstilles
- kalenderen hopper tilbake til perioden du stod i før søket
- alle prosjekter vises igjen for valgt filter

### Søkefelt
Søkefeltet er satt til type search og statisk placeholder-key er fjernet fra HTML for å unngå konflikt med Prosjektplan/Ansattplan-modus.

### Fasefilter i Prosjektplan
Dropdownen er endret fra kategori-filter til fasefilter:

- Alle prosjektfaser
- Feltperiode
- Workshop / mobilisering
- Workshop-only

Dette endrer kun visning/filter i Prosjektplan. Det endrer ikke prosjektdata.

### Fasefilterlogikk
- Feltperiode viser bare feltperioder/røde blokker.
- Workshop / mobilisering viser bare workshop/grønne blokker.
- Workshop-only viser kun prosjekter som har workshopfase, men ingen feltperiode.
- Alle prosjektfaser viser begge faser som før.

## Ikke endret
- Supabase schema
- RLS
- data.js
- importlogikk
- prosjektdata
- Prosjektleder/Kunde-felt
- IZO-duplikatsikring
- Ansattplan
- bemanning
- drag/resize

## Test
1. Gå til Prosjektplan.
2. Test dropdown:
   - Alle prosjektfaser
   - Feltperiode
   - Workshop / mobilisering
   - Workshop-only
3. Søk på en prosjektleder eller IZO-kode som ligger utenfor perioden.
4. Bekreft at kalenderen hopper til prosjektperioden.
5. Tøm søket.
6. Bekreft at kalenderen går tilbake til perioden du stod i før søket.
7. Bekreft at alle prosjekter vises igjen uten refresh.
