v18.25d sandbox dashboard utilization person-days safe
- Basert på v18.25c.
- Retter utnyttelse fra unik-person-beregning til person-dager i perioden.
- Dette hindrer ulogiske verdier som 200 % utnyttelse.
- Personer på prosjekt vises fortsatt som unike personer i perioden.
- Utnyttelsesprosenten beregnes som prosjekt-persondager / tilgjengelige kapasitets-persondager.
- Ferie/Syk/Avspasering/Kurs/Travel trekkes ut per dag, ikke for hele perioden.
- Ingen Supabase/datamodell-endring.
- Ingen endring i login/auth, prosjektpanel, personalblokk-popup, spotlight eller gruppe/ikon/expand-collapse.
