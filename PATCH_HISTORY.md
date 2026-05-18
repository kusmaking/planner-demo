# Patch history

## v18.63c — resource planning dashboard mockup implementation

Base: `Locked-v18.62ap-workshop-only-field-render-scroll-approved` + v18.63a/v18.63b capacity model.

Scope:
- Reworked dashboard capacity section into a resource planning view.
- Split capacity into two operational panels:
  - Offshore bemanning
  - Verkstedkapasitet
- Offshore includes Offshore workers + 3 parts innleie.
- Workshop includes only Onshore Workshop Technician / Workshop Technician + Apprentice.
- Engineering is not shown as a capacity row.
- Each panel shows:
  - lowest available resources in the next 14 days
  - peak need in the next 14 days
  - worst capacity gap
  - projects in the period with period, need and status
- Added critical-days matrix for Offshore and Workshop only.

Not touched:
- login
- Supabase schema
- RLS
- Edge Functions
- project staffing add/remove
- calendar data model
- main branch

Test:
- `node --check app.js` OK
