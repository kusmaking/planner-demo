# PATCH v18.62h — Project workbench Outlook floating window fix

Base: `v18.62g-project-workbench-outlook-window-fix-sandbox`

## Scope
Controlled sandbox patch for the project assignment workbench window only.

## Changes
- Project workbench now opens as a real floating window instead of filling the whole screen.
- Added always-visible red close button in the top-right of the window.
- Existing close buttons are still active in the header/footer.
- Window can be dragged freely in both X and Y directions from the top header.
- Window can be resized from edges and corners, not only the bottom-right browser resize corner.
- Added Fullvisning / restore-style behavior via the existing window state.
- Reset window returns to a safe default position and size.

## Not changed
- Login
- Supabase
- RLS
- Edge Functions
- Calendar data/render logic
- Assignment/overbooking logic
- Import
- Main branch

## Validation
- `node --check app.js` OK.
