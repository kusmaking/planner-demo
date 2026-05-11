# v18.60d — Employee admin open personal plan fix

Sandbox patch based on v18.60c.

## Scope

Fixes the button from Ansattadmin detail panel to Ansattplan.

## Change

- Keeps the visible employee name in the calendar search input.
- Stores the internal search value lowercase so the existing employee filter matches names correctly.
- Clears group/dashboard filters before opening Ansattplan so a previously selected filter cannot hide the selected employee.
- Opens the existing personal calendar view through the existing `openPersonalCalendarView()` flow instead of manually switching tabs.

## Not changed

- Login
- Supabase
- RLS
- Edge Functions
- Calendar rendering logic
- Project plan
- Crew assignment
- Main branch
