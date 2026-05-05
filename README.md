# Izomax Personalplanlegger – Clean rollback package

## Version
v18.35f-clean-rollback-login-safe

## Purpose
This ZIP is a clean rollback package to remove the failed v18.37 import/cache-bust mismatch.

Use this to restore sandbox when login fails with:

- app.js?v=18.37c
- Cannot read properties of null (reading 'addEventListener')

## Contents
These files are from the same stable rollback line and should be uploaded together:

- index.html
- app.js
- data.js
- image/logo assets

## Important
Do not mix these files with files from v18.37a/v18.37b/v18.37c.

This package removes the failed `?v=18.37c` script references.

Correct script references at the bottom of index.html:

```html
<script src="./data.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="./app.js"></script>
```

## Test after upload
1. Upload/replace all files in sandbox.
2. Commit to sandbox.
3. Wait for Vercel deployment to finish.
4. Open sandbox in incognito.
5. Test login only.
6. Then test Dashboard, Ansattplan and Prosjektplan.

## Do not test
Do not test or re-add CSV import until login and core planner are stable again.
