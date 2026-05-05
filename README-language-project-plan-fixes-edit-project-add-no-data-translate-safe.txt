v18.35c-language-project-plan-fixes-edit-project-add-no-data-translate-safe

Utgangspunkt:
- v18.35b-language-project-plan-more-coverage-safe

Fikser etter test:
1. Available-listen:
   - "Velg" endres til "Add" på engelsk.
   - "Valgt" endres til "Selected" på engelsk.

2. Prosjektdata skal ikke automatisk oversettes:
   - Prosjektnavn, notater, lokasjon og prosjekttekst beholdes akkurat slik det er skrevet.
   - Prosjektkategori beholdes som lagret verdi.
   - Kun fallback/label som "Ikke satt" oversettes til "Not set".

3. Edit project / prosjektmodal:
   - Tittel Nytt prosjekt / Rediger prosjekt oversettes.
   - Lukk, Prosjektnavn, flere perioder, prosjektperioder, feltoppdrag/workshop-seksjoner, notater, Lagre/Slett får språkstøtte.
   - Selve prosjektverdiene endres ikke.

Bevisst ikke endret:
- Supabase / database / RLS
- data.js
- interne statusverdier og lagrede verdier
- prosjektdata/fritekst
- ansattadmin
- dashboard/admin/logg
- drag/resize/workshop/feltlogikk
