# Drive Layout Shift — DevTools Verification

**Date:** 2026-06-13  
**Todo:** `devtools-verify` (Step 1 of layout-shift fix plan)  
**Method:** Automated Playwright reproduction against `npm run dev` at `http://localhost:3000`  
**Script:** `scripts/verify-drive-layout-shift.mjs`

---

## Reproduction flow

1. Log in as admin (`admin@jmvisa.com`)
2. Open Drive tab, wait for browse API + `Showing N files` footer
3. Open **New → New folder**, submit create
4. Sample layout metrics at: baseline, modal open, POST 201, modal detached, every 400ms for 3.2s, silent refresh complete

Viewport: **1440×900** (also confirmed at 1440×500 — same 280px loss).

---

## Confirmed: layout shift reproduces

| Phase | `main` width | `main.right` | Dead zone (1440 − right) | Refresh spinning |
|-------|-------------|--------------|--------------------------|------------------|
| Baseline | 1184px | 1440 | 0px | no |
| Modal open | 1184px | 1440 | 0px | no |
| POST 201 / modal closed | **904px** | **1160** | **280px** | yes |
| Through +3.2s samples | 904px | 1160 | 280px | yes → no |
| Silent refresh complete | 904px | 1160 | 280px | no |

`header` and tab scroller (`flex-1 overflow-y-auto`) track `main` exactly — the whole main column compresses, not just the Drive grid.

Shell root (`div.relative.flex.min-h-screen`) stays **1440px** full width; sidebar stays **256px**.

---

## Body / html inline styles (scroll-lock hypothesis)

| Property | Baseline | Modal open | Modal just closed |
|----------|----------|------------|-------------------|
| `body.style.overflow` | *(empty)* | `hidden` | *(empty)* |
| `body.style.paddingRight` | *(empty)* | *(empty)* | *(empty)* |
| `getComputedStyle(body).paddingRight` | `0px` | `0px` | `0px` |
| `window.innerWidth − html.clientWidth` (scrollbar width) | 0 | 0 | 0 |
| `html.scrollbarGutter` | `auto` | `auto` | `auto` |
| Tab scroller `scrollbarGutter` | `stable` | `stable` | `stable` |

In this headless Chromium run, **`body.style.paddingRight` was never set** (scrollbar width measured as 0). `DriveModal` still sets `body.style.overflow = "hidden"` while open and clears it on close — but the large visible shift is **not** explained by padding compensation in this environment.

> On Windows Chrome with a visible page scrollbar, padding-right compensation may still contribute a smaller additional shift; that was not observable here.

---

## Primary cause identified: toast in flex shell

At the moment of shift, shell `children` change from 2 → 3:

**Before create:** `ASIDE` (256px) + `MAIN` (1184px)

**After create (`showToast("Folder created")`):** `ASIDE` (256px) + `MAIN` (904px) + **`DIV` toast (280px)**

The new node matches `CrmToast`:

```20:20:src/components/crm/layout/CrmToast.tsx
      className={`relative overflow-hidden fixed top-20 left-1/2 -translate-x-1/2 z-[350] flex items-start gap-3 px-4 py-3 rounded-xl border border-l-4 min-w-[280px] max-w-[480px] ...
```

`CrmToast` is rendered inside the flex shell in `CrmLayoutShell.tsx` alongside `main`. Despite `fixed` positioning, the toast **participates in the flex row** and steals exactly **280px** (`min-w-[280px]`) from `main.flex-1`:

`256 + 904 + 280 = 1440`

This aligns with user timing:

- Shift starts when create succeeds → toast mounts + modal closes
- Refresh icon spins during silent `browseFolder` (~0.8–3.9s in server logs)
- Toast auto-dismiss is **5s** (`TOAST_DURATION_MS.success`), so compression can outlast the refresh spinner

---

## Silent refresh correlation

Post-create flow in `DriveTab.tsx`:

1. `upsertDriveItem` (optimistic)
2. `showToast("Folder created")` → **toast flex child appears (280px shift)**
3. Modal closes → `body.overflow` restored
4. `browseFolder(..., { silent: true })` → `isRefreshing = true` until GET returns

The refresh spinner **does not add width CSS**; it marks the window where the toast-driven compression is visible. Removing the redundant silent refresh (plan Step 4) would shorten the spinner overlap but **would not fix the 280px shift** while the toast is mounted.

---

## Implications for fix steps

| Plan step | Still relevant? |
|-----------|-----------------|
| Step 2 — fix `DriveModal` body scroll lock | Yes, for modal open/close scrollbar edge cases; secondary to toast issue here |
| Step 3 — `scrollbar-gutter: stable` on shell | Belt-and-suspenders; does not address toast flex participation |
| Step 4 — remove post-create silent refresh | Reduces spinner duration; does not fix 280px compression |
| **Not in plan** — portal `CrmToast` out of flex shell (or `absolute`/`pointer-events-none` wrapper) | **Required** to fix the measured 280px shift |

---

## How to re-run

```bash
# Dev server must be running
node scripts/verify-drive-layout-shift.mjs
```

Full sample log: `scripts/verify-drive-layout-shift-output.txt`

---

## Success criteria for this verification todo

- [x] Bug reproduced after folder create
- [x] `body` / `main` inline + computed widths captured during post-modal refresh window
- [x] Shift mechanism identified (toast flex child, with scroll-lock as secondary)
- [x] Correlation with `isRefreshing` documented
