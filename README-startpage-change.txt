Izomax personalplanlegger - v18.32a before-login startpage

Endring:
- Ny oppstartsside vises før innlogging.
- Ingen prosjektdata, ansattdata, kalenderdata eller adminfunksjoner vises før innlogging.
- Innlogging skjer direkte fra oppstartssiden med eksisterende Supabase Auth.
- Etter innlogging åpnes eksisterende planner-app som før.

Avgrensning:
- Planner/Superadmin-startskjermen er ikke endret.
- Supabase/datamodell er ikke endret.
- data.js er ikke endret.
- Eksisterende prosjektplan, ansattplan, rediger prosjekt, workshop/feltlogikk og direkte blokker er ikke bevisst endret.

Filer endret:
- index.html
- app.js

Test i sandbox:
1. Åpne sandbox i inkognito/logget ut: skal vise kun oppstartsside/login.
2. Logg inn som planner/superadmin: skal åpne eksisterende planner.
3. Test Ansattplan, Prosjektplan, Rediger prosjekt og direkte blokk.
4. Sjekk at project-gk88f production ikke røres før PR/merge senere.
