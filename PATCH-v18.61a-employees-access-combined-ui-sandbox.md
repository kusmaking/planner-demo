# PATCH v18.61a — Employees + Access combined UI sandbox

Base: Locked-v18.60d-employee-admin-master-detail-open-plan-fix-approved

Scope: UI-only consolidation of employee administration and access administration.

Changed:
- Renamed Ansattadmin view to `Ansatte og tilganger`.
- Moved existing `Brukertilganger` panel into the employee administration page.
- Moved existing `Tilgangssøknader` panel into the employee administration page.
- Kept the same existing IDs and event handlers for access users and access requests.
- Kept Admin tab for system/log views only.
- Changed the employee detail button `Tilgangsadmin` so it opens the access section on the same employee page instead of switching to Admin.

Not changed:
- Login/auth flow.
- Supabase schema.
- RLS.
- Edge Functions.
- Access approval logic.
- Role update logic.
- Employee CRUD logic.
- Calendar/project/bemanning logic.
- Main branch.

Validation:
- `node --check app.js` passed.
- Checked for duplicate HTML IDs: none found.

Test order:
1. Login.
2. Open `Ansatte og tilganger`.
3. Search/select employee.
4. Open `Tilganger og søknader` section.
5. Confirm existing user access list renders.
6. Confirm access request list renders.
7. Test refresh buttons.
8. Test employee detail button `Tilgangsadmin` scrolls to the same-page access section.
9. Confirm Admin tab still opens system/log views.
