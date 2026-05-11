# PATCH v18.58b — Access request existing employee link guard — sandbox

Base:
v18.58a-employee-plan-layout-cleanup-sandbox

Scope:
Kun tilgangssøknad/admin-oppsett for employee-tilgang. Beholder v18.58a Ansattplan-layoutendringene.

Endringer:
- La inn tydelig ansattkobling i samlet tilgangsflyt.
- Søknad matches mot eksisterende aktive ansatte på e-post, telefon og navn.
- Ved match blir eksisterende ansatt valgt som standard.
- “Opprett ny ansatt” er nå et eksplisitt sekundærvalg.
- Komplett tilgang kan ikke fullføres for employee uten at admin enten velger eksisterende ansatt eller eksplisitt velger ny ansatt.
- Ved eksisterende ansatt lagres `access_requests.linked_employee_id` før Edge Function kjøres.
- Payload til Edge Function inkluderer `employee_id`, `linked_employee_id` og `create_new_employee`.
- Kalender, prosjektplan, bemanning, import, dashboard, Supabase RLS og Edge Functions er ikke endret.

Test:
- `node --check app.js` OK.

Sandbox testliste:
1. Opprett test-søknad for en ansatt som allerede finnes.
2. Åpne Admin → Tilgangssøknader.
3. Sjekk at match vises under Ansattkobling / duplikatkontroll.
4. Sjekk at eksisterende ansatt er valgt som standard.
5. Generer midlertidig passord.
6. Fullfør tilgang.
7. Sjekk at det ikke opprettes ny rad i `planner_employees`.
8. Test at “Opprett ny ansatt” kun brukes når personen faktisk ikke finnes fra før.
