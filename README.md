v18.30f sandbox force project edit button safe
- Basert på v18.30e.
- Legger Rediger prosjekt inn via en robust DOM-injeksjon etter at prosjektpanelet er rendret.
- Dette skal gjøre knappen synlig uavhengig av hvilken panelstruktur/CSS som faktisk vises.
- Knappen åpner eksisterende prosjektmodal med workshop/feltperiode/ressursbehov.
- Beholder bredere prosjektpanel på ca. 560px.
- Ingen Supabase/datamodell-endring.
- Ingen endring i workshoplogikk, bemanningslogikk, login/auth, spotlight, personalblokk-popup eller grupper/ikoner/expand-collapse.
