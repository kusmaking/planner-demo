# v18.62z — Project workbench assigned actions separate control row

Base: v18.62y

Scope:
- Project workbench only.
- Makes assigned actions visible by rendering a separate `Endre tildelte` control area below the assigned list.
- Keeps existing edit/delete handlers through `data-project-entry-edit-id` and `data-project-entry-delete-id`.

Changed:
- Added robust visible action rows for assigned employees:
  - Bytt / endre
  - Fjern
- Moved action rendering outside the assigned card text area so buttons are not hidden by text overflow/grid CSS.
- Added targeted CSS for the new action rows.

Not changed:
- Login
- Supabase schema
- RLS
- Edge Functions
- Calendar data
- Assignment logic
- Overbooking logic
- Main

Test:
- `node --check app.js` OK.
