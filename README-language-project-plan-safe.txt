v18.35a-language-project-plan-safe

Utgangspunkt:
- v18.34e-profile-language-highlight-only-safe

Formål:
- Utvide språkstøtte til Prosjektplan, uten å endre prosjektmodaler eller datamodell.

Endret:
- Prosjektplan-kalender:
  - Prosjekt / Project header
  - Feltoppdrag / Field assignment
  - Workshop / mobilisering / Workshop / mobilization
  - behov / need
  - Workshopbehov / Workshop need
  - feltperioder + workshop / field periods + workshop
  - resize-tooltips for prosjekt/workshop
- Prosjektstatus/bemanning som visningstekst:
  - Ikke bemannet / Not staffed
  - Delvis bemannet / Partly staffed
  - Bemannet / Staffed
  - Kansellert / Cancelled
- Prosjektfilter:
  - Alle prosjekter / kategorier / All projects / categories
- Prosjektpanel i Prosjektplan:
  - Tildelte / Assigned
  - Bemanning / Staffing
  - Bemann prosjekt / Staff project
  - Perioder / Periods
  - Rediger perioder / Edit periods
  - Legg til ansatt / Add employee
  - Tilgjengelige / øvrige / Available / others
  - Status / Status
  - diverse tomtilstander og hjelpetekster

Bevisst ikke endret:
- Supabase / database / RLS
- data.js
- interne statusverdier og lagrede verdier
- prosjektmodaler
- opprett/rediger prosjekt-skjema
- ansattadmin
- dashboard/admin/logg
- drag/resize/workshop/feltlogikk

Viktig:
- Interne verdier beholdes på norsk.
- Dette er visningsoversettelse, ikke datamigrering.
- Test særlig Prosjektplan + Uten bemanning i både NO og EN.
