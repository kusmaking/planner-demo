# PATCH HISTORY

## v18.62aj — project workbench remove race-condition fix
- Basert på v18.62ai.
- Fikser at tildelt ansatt kunne forsvinne kort, komme tilbake, og først forsvinne etter Supabase-latency.
- Innfører pending-delete guard for prosjektbemanning slik at realtime/poll-refresh ikke henter slettet tildeling tilbake mens delete-kallet pågår.
- Prosjektvinduet oppdateres umiddelbart etter bekreftet Fjern-klikk.
- Tunge oppdateringer av kalender/dashboard/analyse kjøres etter at prosjektvinduet har respondert.
- Ingen endring i Supabase schema, RLS, Edge Functions, login eller kalenderdatamodell.
