# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.37h-import-worklist-responsible-clean-layout-safe

## Base
Bygger fra:

- v18.37g-import-worklist-full-width-preview-only-safe

## Formål
Rydder Prosjektimport-layouten og legger Project Responsible inn i arbeidslisten.

## Endret

### Layout
- Fjernet den støyende tekstlisten/eksempellisten under "Prosjekter fra CSV".
- Filterknappene er flyttet til venstre over arbeidslisten.
- Arbeidslisten er fortsatt fullbredde.

### Arbeidsliste
Lagt til egen kolonne:

- Project Responsible

Denne hentes fra CSV-kolonnen:

- Project Responsible

### Auto-utfylling
Følgende felt fylles fortsatt automatisk fra CSV i preview:

- Operation start
- Operation stop
- WS start
- WS stop
- Techs needed
- Project Responsible

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
4. Bekreft at filterknappene ligger til venstre.
5. Bekreft at den støyende eksempellisten er borte.
6. Bekreft at Project Responsible vises som egen kolonne.
7. Bekreft at datoer og Techs fortsatt er fylt inn.
