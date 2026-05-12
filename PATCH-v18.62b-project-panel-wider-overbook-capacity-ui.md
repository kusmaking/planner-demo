# PATCH v18.62b — Project panel wider + overbook-capable capacity UI

Base: `v18.62a-project-focus-panel-expanded-layout-sandbox`

## Scope
Controlled sandbox patch for the project focus / staffing panel only.

## Changes
- Wider project inspector panel on desktop: `clamp(720px, 64vw, 1060px)`.
- Calendar remains visible behind the panel; no calendar data/render logic changed.
- Color-coded capacity cards in the panel:
  - Green: available / ledig
  - Yellow: partial / delvis
  - Red: busy / opptatt / overbook
- Employee candidate rows now get clear left status markers:
  - Green = available
  - Yellow = partially available
  - Red = busy
- Busy employees can now be selected from the project panel.
- Busy/conflicting assignment is allowed from this panel and saved with note:
  `OVERBOOKET fra prosjektpanel - kontroller i Ansattplan`
- Existing Ansattplan conflict rendering is retained so overlapping assignments can be seen on the employee side.

## Not changed
- No Supabase schema changes.
- No RLS changes.
- No Edge Function changes.
- No login changes.
- No project/calendar table structure changes.
- No main branch changes.

## Test
- `node --check app.js` passed.
