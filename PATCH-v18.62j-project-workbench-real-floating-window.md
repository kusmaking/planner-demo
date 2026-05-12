# PATCH v18.62j — Project workbench real floating window

Scope: prosjektbemanning popup/workbench only.

Changes:
- Moves the project workbench out of the calendar side-panel container while it is open, so it cannot be clipped by the old panel/flex layout.
- Keeps the calendar visible behind the workbench.
- Adds a clearly visible close control at the left side of the window header plus the red X in the top right.
- Keeps the window inside the viewport on open, drag and resize.
- Allows free movement horizontally and vertically by dragging the header.
- Allows resizing from edges/corners.
- Keeps Fullvisning and Nullstill as explicit buttons only; clicking/dragging the window no longer changes its size.
- Removes the bad drag bug that referenced an undefined resize handle.

Not changed:
- login
- Supabase/RLS/Edge Functions
- calendar data/rendering logic
- assignment save logic
- overbooking logic
- import
- main

Test:
- node --check app.js = OK
