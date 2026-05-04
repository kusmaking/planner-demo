v18.29 sandbox workshop default phase safe
- Basert på v18.28/v18.27d.
- Prøveversjon uten Supabase/datamodell-endring.
- Alle vanlige prosjekt/feltoppdrag vises rødt, uavhengig av tidligere Offshore/Onshore-kategori.
- Prosjektkategori i prosjektmodal vises som Feltoppdrag og lagres fortsatt som eksisterende kategori-verdi for å unngå datamodellendring.
- Automatisk workshopfase vises grønt i prosjektplanen:
  standard start = 14 dager før feltstart,
  standard slutt = dagen før feltstart,
  standard behov = 2 ressurser.
- Workshopfasen er foreløpig beregnet/visuell og lagres ikke permanent.
- Onshore-gruppen vises som Workshop technician, men intern verdi beholdes som Onshore arbeider.
- Personalblokker beholdes: Syk blodrød, Kurs grå, Ferie rosa, Avspasering gul, Travel blålig.
- Ingen endring i login/auth, Supabase/datamodell, spotlight, personalblokk-popup eller gruppe/ikon/expand-collapse.
