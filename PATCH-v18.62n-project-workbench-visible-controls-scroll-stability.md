# v18.62n – project workbench visible controls + scroll stability

Sandbox patch.

- Adds a separate floating Outlook-style control bar directly on the workbench shell.
- Makes Lukk/X visible outside the scrollable workbench content.
- Restores visible Rediger prosjekt control from the workbench.
- Keeps Escape close behavior.
- Removes accidentally injected project-workbench controls from account menu markup.
- Stops wheel events inside the project window from bubbling into the calendar, to reduce unstable mouse-wheel behavior.

Not changed:
- login
- Supabase schema/RLS/Edge Functions
- calendar data structure
- assignment/overbooking persistence
- main
