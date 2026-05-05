v18.31f sandbox workshop resource toggle safe
- Basert på v18.31e.
- Prosjektmodalen er ryddet slik at Feltoppdrag og Workshop/mobilisering har tydelige ressursfelt.
- Feltoppdrag har eget felt for behov for antall personer i felt.
- Workshop/mobilisering kan nå tydelig legges til eller fjernes fra prosjektet.
- Fjern workshop setter workshop_enabled=false, nuller workshopdatoer og setter workshopbehov til 0.
- Legg til workshop fyller default: 14 dager før feltstart, slutt dagen før feltstart, ressursbehov 2.
- Endring av workshopbehov og feltbehov lagres fortsatt i eksisterende planner_projects-felter.
- Ingen Supabase/datamodell-endring.
- Ingen endring i drag/resize, bemanningslogikk, login/auth, dashboard, spotlight, personalblokk-popup eller grupper/ikoner/expand-collapse.
