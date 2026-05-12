# v18.62p – Project workbench stable titlebar, close/edit and scroll guard

Sandbox patch based on v18.62l instead of the problematic v18.62m–o attempts.

## Scope

Only the project staffing/workbench window was changed.

## Changes

- Restores the working floating-window behavior from v18.62l.
- Adds a separate Outlook-style titlebar that is always visible above the workbench content.
- Adds visible controls in the titlebar:
  - Rediger prosjekt
  - Nullstill
  - Fullvisning
  - X / Lukk
- Keeps Escape-to-close.
- Keeps bottom `Lukk vindu` button.
- Rediger prosjekt opens the existing project modal positioned over/inside the workbench area instead of behind it.
- Mouse wheel over the project workbench no longer bubbles to the calendar behind it.
- Calendar can still be scrolled when the mouse is outside the project workbench.
- Removes duplicate/internal header controls so the top area does not appear as stacked bars.

## Not changed

- Login
- Supabase schema
- RLS
- Edge Functions
- Calendar data model
- Assignment save logic
- Overbooking logic
- Import
- Main branch

## Test

- `node --check app.js` OK
