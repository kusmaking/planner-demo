# v18.62o — Project workbench clean chrome + edit inside window

Sandbox patch.

Endret kun prosjektbemanningsvinduet:

- Fjernet ekstra topp-overlay fra v18.62n slik at vinduet ikke får dobbel topptekst.
- Beholder én tydelig Outlook-lignende kontrollinje inne i selve vinduet.
- X/Lukk beholdes i kontrollinjen.
- Rediger prosjekt åpnes nå visuelt inne i prosjektvinduets område, over bemanningsinnholdet, ikke bak prosjektkortet.
- Prosjektredigering beholdes med eksisterende felter og lagringslogikk.
- Scroll-stabilisering fra v18.62n beholdes.

Ikke rørt:

- login
- Supabase / RLS / Edge Functions
- kalenderdata
- tildelingslagring
- overbookinglogikk
- main
