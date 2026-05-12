# v18.62t — Project workbench edit design cleanup

Sandbox patch based on v18.62s.

Scope:
- Style the project edit modal opened from the project workbench to match the darker workbench design.
- Keep the normal project modal flow and existing save/delete logic.
- Remove visible instruction text from the workbench footer.
- Keep available employees open by default and partial/busy collapsed from v18.62s.

Not changed:
- Login
- Supabase schema
- RLS
- Edge Functions
- Calendar data/rendering logic
- Assignment/overbooking logic
- Main branch

Test:
- Open Project Plan.
- Open a project workbench.
- Open Rediger prosjekt.
- Confirm the edit view uses the same dark visual language.
- Save/cancel/close as normal.
- Confirm the workbench still closes and scroll behavior is unchanged.
