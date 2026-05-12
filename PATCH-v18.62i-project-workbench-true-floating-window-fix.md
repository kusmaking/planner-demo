# PATCH v18.62i — Project workbench true floating window fix

Base: v18.62h project workbench Outlook floating window sandbox

Scope: project staffing workbench only.

Changes:
- Forces the project workbench to behave as a true floating Outlook-style window.
- Resets the old full-screen overlay constraints from earlier panel versions.
- Adds a clearly visible red X close button as a top-level window control.
- Keeps the existing text close buttons.
- Allows free horizontal and vertical movement from the title/header area.
- Keeps resize handles on all sides/corners.
- Uses a smaller default width so the window can actually move sideways.
- Keeps calendar visible behind the window.

Not changed:
- login
- Supabase
- RLS
- Edge Functions
- assignment saving
- overbooking logic
- calendar data/rendering logic
- main branch

Test:
- node --check app.js = OK
