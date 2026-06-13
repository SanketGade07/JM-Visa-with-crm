# Drive Layout — Regression Test (Step 5)

**Date:** 2026-06-13  
**Todo:** `regression-test`  
**Method:** Automated Playwright regression against `npm run dev` at `http://localhost:3000`  
**Script:** `scripts/regression-drive-layout.mjs`  
**Output:** `scripts/regression-drive-layout-output.json`

---

## Result: **PASS** (all flows)

Viewport **1440×900**, tolerance **≤2px** width loss / dead zone.

| Flow | Layout stable | Refresh spinner | Toast visible | Notes |
|------|---------------|-----------------|---------------|-------|
| New folder (modal) | ✅ | no | yes | No post-create silent refresh; optimistic insert only |
| New blank file (modal) | ✅ | no | yes | Same as folder create |
| File upload | ✅ | yes (expected) | yes | `refreshCurrent()` after upload; layout stays full width |
| Rename (modal) | ✅ | yes (expected) | yes | Modal open/close + `refreshCurrent()` |
| Delete (modal) | ✅ | yes (expected) | yes | Modal open/close + `refreshCurrent()` |
| Manual Refresh | ✅ | yes → no | yes* | Navbar + Drive card remain 1184px (`main.right` = 1440) |

\*Toast from prior rename/delete may still be visible during manual refresh sampling; layout unaffected.

**Baseline `main` width:** 1184px  
**Max width loss across all flows:** 0px  
**Max dead zone (viewport − `main.right`):** 0px

---

## Fixes validated

| Change | Effect |
|--------|--------|
| `DriveModal` scroll lock on `[data-crm-scroll-container]` (no `body.paddingRight`) | Modal open/close does not compress shell |
| `html { scrollbar-gutter: stable; }` + `w-full` on CRM shell/main | Scrollbar toggles do not steal layout width |
| Removed post-create `browseFolder({ silent: true })` | No 3–4s refresh spinner after folder/file create |
| **`CrmToast` portaled to `document.body`** | Toast no longer participates in flex row (was 280px `main` compression) |

The toast portal was required for regression pass; see `DEVTOOLS_VERIFY.md` for the original measurement (`256 + 904 + 280 = 1440`).

---

## How to re-run

```bash
# Dev server must be running
node scripts/regression-drive-layout.mjs
```

Optional env: `CRM_BASE_URL`, `CRM_LOGIN_EMAIL`, `CRM_LOGIN_PASSWORD`.

---

## Success criteria (plan Step 5)

- [x] After creating a file/folder, navbar and Drive card remain **full width**
- [x] No layout jump tied to refresh spinner after create (spinner no longer fires on create)
- [x] Modals still prevent background scroll while open
- [x] New items still appear immediately via optimistic `upsertDriveItem`
- [x] Upload, rename, delete, and manual refresh — layout stable
