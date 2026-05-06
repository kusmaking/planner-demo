# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.39d-project-search-mode-and-clear-hard-reset-safe

## Base
Bygger fra:
- v18.39c-project-search-clear-reset-safe

## Formål
Fikser fortsatt bug i Prosjektplan-søk der søket kunne bli hengende etter at feltet var tømt, og søkefeltet kunne vise feil placeholder "Søk ansatt" i Prosjektplan.

## Endret

### Søkefelt
- Search input er endret til type="search".
- Statisk oversettelses-placeholder på input er fjernet, slik at appen selv styrer "Søk prosjekt" / "Søk ansatt".
- Når Prosjektplan rendres, tvinges søkefeltet til Prosjektmodus.

### Hard reset ved tomt søk
Når søkefeltet tømmes:
- state.search tømmes
- prosjektfokus fjernes
- prosjektpanel lukkes
- prosjekt-spotlight fjernes
- kalenderen rendres på nytt
- alle prosjekter i valgt periode/filter vises igjen

### Defensiv filtrering
Prosjektfilteret leser faktisk input-verdi og ignorerer gammel state.search hvis inputfeltet er tomt.

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
2. Søk på prosjektleder, f.eks. Erlend.
3. Slett hele søket.
4. Bekreft at placeholder fortsatt er Søk prosjekt.
5. Bekreft at alle prosjekter i perioden kommer tilbake uten refresh.
