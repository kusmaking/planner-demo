# v18.62q — Project workbench restore floating + visible close/edit

Bygger fra v18.62l, fordi denne hadde beste vindusoppførsel.

Endringer:
- Beholder flytende prosjektvindu fra v18.62l.
- Legger til en liten, alltid synlig kontrolløy øverst til høyre i prosjektvinduet.
- Tydelig X/lukk.
- Tydelig Rediger prosjekt.
- Beholder Nullstill og Fullvisning.
- Escape lukker fortsatt vinduet.
- Rediger prosjekt åpner prosjektmodal over prosjektvinduet.
- Scroll over prosjektvinduet stoppes fra å scrolle kalenderen bak.

Ikke endret:
- Login
- Supabase/RLS/Edge Functions
- Kalenderdata
- Tildelingslogikk
- Overbookinglogikk
- Import
- Main

Bakgrunn:
Rollback til v18.62d fjernet for mye. Denne patchen gjenoppretter den fungerende flytende workbench-retningen fra v18.62l, men fikser kun synlig close/edit-kontroll.
