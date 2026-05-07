# Locked v18.45 - employee dashboard polish safe

Base: `Locked-v18.44c-employee-own-projects-rls-tested`.

Denne pakken gjør kun en kontrollert forbedring i ansattportalen / Employee `Min side`.

Endret:
- `app.js`
- `index.html`
- `README.md`

Ikke endret:
- `data.js`
- Supabase/RLS
- tilgangssøknader/godkjenning
- brukerroller
- import
- prosjektplan
- bemanning/tildeling
- admin/planner/superadmin-flyt

Innhold:
- Rydder visuell presentasjon av ansattportalens oppstartsside.
- Fjerner intern prosjekt-ID som fallback i tittelen på neste prosjekt.
- Viser prosjektnavn alene dersom IZO-/PRJ-kode ikke finnes i prosjektnavn/felt.
- Gjør tom-/manglende ansattprofil-visning tydeligere.

Test:
1. Logg inn som employee-testbruker.
2. Bekreft at neste prosjekt viser lesbart prosjektnavn, ikke intern UUID-prefix.
3. Bekreft at periode, rolle og workshop/feltperiode fortsatt vises.
4. Bekreft at Logg ut fortsatt fungerer.
5. Bekreft at superadmin/planner fortsatt åpner vanlig planner.
