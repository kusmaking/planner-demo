# PATCH v18.61b — Employee card access controls sandbox

Base: v18.61a-employees-access-combined-ui-sandbox

Scope: Controlled UI cleanup for `Ansatte og tilganger`.

Changed:
- Added direct access control on the selected employee detail card.
- If the employee already has a matching user profile by email, the card now shows:
  - current access status
  - role dropdown
  - save role button
  - activate/deactivate access button
  - temporary password input
  - generate password button
  - set password button
- If the employee has a matching access request, the card now shows request status and quick actions.
- Kept full `Alle tilganger og søknader` panel as advanced overview/history.
- Renamed the old `Tilgangsadmin` button to `Alle tilganger`.
- The existing access functions and Edge Functions are reused; no new backend logic was introduced.

Not changed:
- Login/auth flow.
- Supabase schema.
- RLS.
- Edge Functions.
- Employee CRUD logic.
- Calendar/project/bemanning logic.
- Main branch.

Validation:
- `node --check app.js` passed.
- Checked for duplicate HTML IDs: none found.

Test order:
1. Login.
2. Open `Ansatte og tilganger`.
3. Select an employee with existing access.
4. Change role from the employee card and save.
5. Generate/set temporary password from the employee card.
6. Activate/deactivate access from the employee card.
7. Select employee with pending access request and test quick actions.
8. Confirm `Alle tilganger og søknader` still opens for full overview.
9. Confirm Ansattplan and calendar still open normally.
