# Izomax Personalplanlegger – Sandbox changelog

## Versjon
v18.36b-admin-screens-cleanup-safe

## Base
Bygger fra låst sandbox-base:

- Locked-v18.35f-restore-available-select-button-safe

## Formål
Dette er en kontrollert oppryddingsversjon før videre redesign av admin-/importområder.

Vi stopper videre oversettelse av gamle Prosjektadmin, Ansattadmin og Admin inntil vi har bestemt ny struktur.

## Endret

### Dashboard / oppstart
Snarveier til følgende sider er fjernet fra dashboard/oppstart:

- Prosjektadmin
- Ansattadmin

Dashboard peker nå kun til de operative hovedflytene:

- Ansattplan
- Prosjektplan
- Uten bemanning

### Prosjektadmin
Gammel Prosjektadmin-visning er deaktivert i UI.

Siden viser nå en ryddig placeholder for fremtidig:

- Prosjektimport
- CSV/Excel-upload
- forhåndsvisning
- validering
- opprettelse av prosjekter

Importfunksjonen er ikke aktiv ennå.

### Ansattadmin
Gammel Ansattadmin-visning er deaktivert i UI.

Siden viser nå en ryddig placeholder for fremtidig redesign:

- ansattoversikt
- grupper og roller
- aktiv/inaktiv

### Admin
Gammel Admin-visning er deaktivert i UI.

Siden viser nå en ryddig placeholder for fremtidig redesign:

- brukere og roller
- systemstatus
- importhistorikk

## Bevisst ikke endret

- Supabase
- database/datamodell
- RLS
- data.js
- Prosjektplan
- Ansattplan
- kalenderlogikk
- prosjektdata/fritekst
- drag/resize
- workshop/feltlogikk
- bemanningslogikk

## Viktig teknisk merknad

Gammel kode er ikke hardt slettet ennå. Den er deaktivert/omgått slik at vi kan teste ny flyt uten å risikere unødvendig regresjon.

Dette er bevisst gjort som et trygt mellomsteg:
1. Skjul/deaktiver gammel UI
2. Test at hovedsystemet fortsatt fungerer
3. Design nye admin/import-sider
4. Rydd eventuell gammel kode senere

## Testpunkter i sandbox

1. Åpne dashboard/oppstart.
2. Bekreft at Prosjektadmin og Ansattadmin ikke lenger vises som snarveier.
3. Test Ansattplan.
4. Test Prosjektplan.
5. Test Uten bemanning.
6. Åpne Prosjektadmin-fanen og se at Prosjektimport-placeholder vises.
7. Åpne Ansattadmin-fanen og se at redesign-placeholder vises.
8. Åpne Admin-fanen og se at redesign-placeholder vises.
9. Bekreft at Supabase-data fortsatt lastes.
10. Bekreft at prosjektdata/fritekst ikke er endret.

## Neste naturlige steg

Neste anbefalte arbeid:

1. Designe Prosjektimport-siden
2. Avklare CSV/Excel-format
3. Lage import-preview før lagring
4. Redesigne Ansattadmin
5. Redesigne Admin
