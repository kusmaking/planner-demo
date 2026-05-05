v18.32c - bakgrunnsbilde i hele Personalplanen (sandbox)

Denne endringen gjør kun én ting:
- Lagrer Izomax-bildet som et globalt, diskret bakgrunnsbilde/watermark i hele appen.

Bevisst ikke endret:
- Supabase / database / RLS
- data.js
- Planner-logikk og funksjoner
- Ansattplan / Prosjektplan / Admin-logikk
- Modaler og tildelinger

Teknisk løsning:
- Global body-bakgrunn bruker nå eksisterende izomax-login-worker.png
- Det ligger under en mørk gradient for å bevare lesbarhet og redusere risiko for UI-støy
- Oppstartssiden beholdes ellers som før
