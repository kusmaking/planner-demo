v18.30 sandbox workshop persistence safe
- Basert på Locked-v18.29.
- Krever at SQL-feltene workshop_enabled, workshop_start_date, workshop_end_date og workshop_headcount_required er lagt til i planner_projects.
- Appen leser og skriver lagrede workshopfelt.
- Prosjektmodalen har nå Workshop / mobilisering-seksjon:
  aktivert/deaktivert, startdato, sluttdato og ressursbehov.
- Nye/eksisterende prosjekter får default workshopverdier fra databasen eller forslag:
  14 dager før feltstart, slutt dagen før feltstart, ressursbehov 2.
- Prosjektplan viser workshopfase grønn basert på lagrede verdier.
- Feltoppdrag/prosjektets hovedperiode vises rød.
- Ingen drag/resize av workshopfase ennå; dette tas først etter at lagring er verifisert.
- Ingen endring i login/auth, spotlight, personalblokk-popup eller gruppe/ikon/expand-collapse.
