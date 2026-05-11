# Patch v18.60b — Employee admin visual cleanup only

Base: v18.58b access-request existing employee link guard / login-safe rollback base.

Scope:
- Ansattadmin visual cleanup only.
- Replaces long employee cards with a compact searchable table/list.
- Adds KPI row for active employees, inactive employees, missing e-mail, and possible duplicate names.
- Adds search, group filter, and active/all/inactive filter.
- Moves bulk add and direct personal block into an "Avansert" section to reduce page height.

Not changed:
- Login/auth flow.
- Admin access request flow.
- Role admin / user access panels.
- Calendar rendering.
- Project plan / staffing logic.
- Supabase tables, RLS, Edge Functions, or import logic.

Validation:
- node --check app.js OK.
