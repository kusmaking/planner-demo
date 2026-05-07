# Locked-v18.45b-employee-project-details-v1-safe

Base: `Locked-v18.45-employee-dashboard-polish-safe`.

## Endret

- `app.js`
- `index.html`
- `README.md`

## Scope

Dette er en kontrollert visningsforbedring av ansattportalen / Employee Min side.

## Hva er forbedret

- Neste prosjekt-kortet viser mer relevant prosjektdetalj.
- Prosjekttittel bygges som `IZO-XXXXX Prosjektnavn` når prosjektkode finnes.
- Intern prosjekt-ID/UUID-lignende tekst fjernes fra employee-visningens tittel-fallback.
- Viser nå tydeligere:
  - Din periode
  - Prosjektperiode
  - Rolle
  - Prosjektleder
  - Kunde
  - Workshop / feltperiode
  - Fase/status-linje når data finnes
- Layouten er strammet opp med detaljert metagruppe i employee-portalen.

## Ikke endret

- Supabase/RLS
- Tilgangssøknader/godkjenning
- Brukerroller
- Import
- Prosjektplan
- Bemanning/tildeling
- Admin/planner/superadmin-flyt
- `data.js`

## Test

1. Logg inn som employee-testbruker.
2. Bekreft at neste prosjekt vises.
3. Bekreft at tittel ikke viser intern UUID/id.
4. Bekreft at Prosjektleder og Kunde vises hvis prosjektet har disse feltene.
5. Test Logg ut.
6. Logg inn som superadmin/planner og bekreft at vanlig planlegger fortsatt fungerer.
