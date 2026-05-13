# PATCH HISTORY

## v18.62an — single calendar scroll
- Removed the internal vertical scrollbar from `calendarWrap`.
- Calendar keeps horizontal scrolling only.
- Normal mouse-wheel over the calendar now scrolls the outer page/frame.
- Shift+wheel / horizontal touchpad movement still scrolls the calendar horizontally.
- No changes to project staffing, Supabase, RLS, Edge Functions, login, or main.

## v18.62al-today-line-clean-marker
- Fjernet tekstbadge "I dag" fra datoheaderen.
- Fjernet blå fyll/highlight i dagens datokolonne.
- La inn én ren vertikal dagens-dato-linje som ikke lager horisontale merker i prosjektblokkene.
- Ingen endring i prosjektbemanning, Supabase, RLS, Edge Functions eller login.

# PATCH HISTORY

## v18.62aj — project workbench remove race-condition fix
- Basert på v18.62ai.
- Fikser at tildelt ansatt kunne forsvinne kort, komme tilbake, og først forsvinne etter Supabase-latency.
- Innfører pending-delete guard for prosjektbemanning slik at realtime/poll-refresh ikke henter slettet tildeling tilbake mens delete-kallet pågår.
- Prosjektvinduet oppdateres umiddelbart etter bekreftet Fjern-klikk.
- Tunge oppdateringer av kalender/dashboard/analyse kjøres etter at prosjektvinduet har respondert.
- Ingen endring i Supabase schema, RLS, Edge Functions, login eller kalenderdatamodell.

## v18.62ak - Today marker + project plan scroll polish
- Ryddet dagens dato-markering: fjernet doble blå sidelinjer og tunge highlights.
- Beholder en roligere I dag-markering i datoheaderen.
- La til trygg scroll-stabilisering på kalenderen: auto scroll-behavior, stable scrollbar gutter og overflow-anchor av.
- Ikke rørt bemanningslogikk, Supabase, RLS, Edge Functions, login eller main.

## v18.62am-calendar-wheel-scroll-fix-sandbox
- Fikset mouse-wheel scrolling i kalender/prosjektplan slik at vertikal scroll fungerer direkte over kalenderen.
- Beholder scrollbar-dragging og horisontal scroll.
- Ingen endring i prosjektbemanning, Supabase, RLS, Edge Functions, login eller main.



## v18.62ao - single vertical page scroll hard fix
- Fjernet `overflow-auto` fra calendarWrap-markup.
- Tvinger kalenderen til kun å eie horisontal scrolling.
- Skjuler/fjerner intern vertikal scrollbar i kalenderområdet.
- Mouse-wheel over kalender flytter nå ytre side/frame vertikalt.
- Beholder horisontal scroll for kalender/tidslinje.
- Ingen endringer i prosjektbemanning, login, Supabase, RLS, Edge Functions eller main.
