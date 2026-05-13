# PATCH_HISTORY

## v18.62ai — Project workbench remove immediate UI response
- Based on v18.62ah.
- Fixes slow perceived remove action in project staffing.
- Assigned row is now visually removed immediately after confirmation.
- Supabase deletion still runs using existing planner_entries delete logic.
- If deletion fails, the row is restored and the user is warned.
- No Supabase schema, RLS, login, calendar data model, or main changes.
