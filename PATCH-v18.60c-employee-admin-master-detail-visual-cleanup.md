# v18.60c — Employee admin master-detail visual cleanup

Base: v18.60b employee-admin visual cleanup only / v18.58b login-safe lineage.

Scope:
- Ansattadmin visual/UI only.
- Moves the Ansattadmin screen closer to the approved mockup direction.
- Keeps existing edit modal and underlying employee functions.
- Does not move Rolleadmin/Tilgangssøknader into this screen yet.

Changes:
- Dark master-detail layout for Ansattadmin.
- Left side: searchable/filterable employee register.
- Right side: selected employee detail panel.
- Row click selects employee; double-click or detail button opens existing edit modal.
- Detail panel shows profile, contact info, access status hint, and upcoming assignments.
- Advanced panel remains below for bulk add/direct employee block.

Not changed:
- Login/auth.
- Calendar logic.
- Project logic.
- Staffing logic.
- Supabase schema/RLS.
- Edge Functions.
- Access request completion logic.
- Main branch.

Test:
- node --check app.js OK.
