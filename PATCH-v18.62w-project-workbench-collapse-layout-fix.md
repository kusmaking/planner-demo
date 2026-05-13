# Patch v18.62w — Project workbench collapse layout fix

Base: `planner-demo-v18.62v-project-workbench-remove-assigned-sandbox.zip`

## Endret
- Fikser overlapp mellom `Ledig hele perioden`, `Delvis ledig` og `Opptatt / overbook` i prosjektbemanningsvinduet.
- `Ledig hele perioden` er fortsatt åpen som standard.
- `Delvis ledig` og `Opptatt / overbook` er fortsatt kollapset som standard.
- Kollapsede seksjoner skjuler nå innholdet helt og tar kun header-plass.
- Kandidatlisten bruker én samlet scroll i prosjektvinduet i stedet for flere små overlappende scrollfelt.

## Ikke rørt
- Login
- Supabase
- RLS
- Edge Functions
- Kalenderdata
- Tildeling
- Overbooking
- Fjern/Endre tildelte
- Main

## Test
- `node --check app.js` OK.
