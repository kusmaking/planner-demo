# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.39c-project-search-clear-reset-safe

## Base
Bygger fra:
- v18.39b-project-search-jump-to-project-period-safe

## Formål
Fikser bug der prosjekt-søk ikke nullstilte visningen når søkefeltet ble tømt.

## Endret

### Prosjektplan-søk
Når søkefeltet tømmes:
- state.search tømmes
- prosjektfokus nullstilles
- prosjektpanel lukkes
- prosjekt-spotlight nullstilles
- kalenderen rendres på nytt
- alle prosjekter vises igjen for valgt periode/filter

### Search-event
Lagt til støtte for browserens search-event i tillegg til input-event. Dette hjelper spesielt når søkefelt tømmes via clear/escape.

## Ikke endret
- Supabase schema
- RLS
- data.js
- importlogikk
- prosjektdata
- Prosjektleder/Kunde-felt
- IZO-kode-søk
- Ansattplan
- bemanning

## Test
1. Gå til Prosjektplan.
2. Søk på en prosjektleder, f.eks. Erlend.
3. Bekreft at treff vises.
4. Tøm søkefeltet.
5. Bekreft at alle prosjekter kommer tilbake uten refresh.
