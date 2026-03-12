# Z-Index Customization Guide for Melitech CRM

This guide explains how to modify z-index values for UI elements, particularly the hamburger menu icon and sidebar navigation.

---

## Z-Index Hierarchy Overview

The application uses the following z-index hierarchy (higher number = appears on top):

| Element | Z-Index | File Location |
|---------|---------|---------------|
| Hamburger Button | `z-[60]` | `DashboardNavbar.tsx` |
| Sidenav Sidebar | `z-50` | `Sidenav.tsx` |
| Sidenav Overlay | `z-40` | `Sidenav.tsx` |
| Main Navbar | `z-30` | `DashboardNavbar.tsx` |
| Dropdown Menus | `z-50` | (Radix UI default) |

---

## File Locations

### Hamburger Menu Button
**File:** `client\src\components\MaterialTailwind\DashboardNavbar.tsx`

**Lines 47-70:**
```tsx
<button
  onClick={() => setOpenSidenav(dispatch, !openSidenav)}
  className={cn(
    "fixed top-4 left-4 z-[60] xl:hidden",  // <-- Z-INDEX HERE
    "p-2.5 rounded-lg shadow-lg transition-all duration-300",
    "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
    "hover:bg-slate-100 dark:hover:bg-slate-700",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    openSidenav ? "left-[280px]" : "left-4"
  )}
>
```

### Sidenav Sidebar
**File:** `client\src\components\MaterialTailwind\Sidenav.tsx`

**Lines 154-160:**
```tsx
<aside
  className={cn(
    "fixed left-0 top-0 z-50 h-screen w-72 transition-transform duration-300",  // <-- Z-INDEX HERE
    "border-r",
    sidenavClasses[sidenavType],
    openSidenav ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
  )}
>
```

### Sidenav Overlay (Dark Background)
**File:** `client\src\components\MaterialTailwind\Sidenav.tsx`

**Lines 147-151:**
```tsx
{openSidenav && (
  <div
    className="fixed inset-0 z-40 bg-black/50 xl:hidden"  // <-- Z-INDEX HERE
    onClick={() => setOpenSidenav(dispatch, false)}
  />
)}
```

### Main Navbar
**File:** `client\src\components\MaterialTailwind\DashboardNavbar.tsx`

**Lines 73-79:**
```tsx
<nav
  className={cn(
    "sticky top-0 z-30 border-b transition-all",  // <-- Z-INDEX HERE
    fixedNavbar
      ? "bg-white dark:bg-slate-900 shadow-md"
      : "bg-transparent"
  )}
>
```

---

## How to Modify Z-Index Values

### Using Tailwind CSS Classes

Tailwind provides predefined z-index utilities:

| Class | Value |
|-------|-------|
| `z-0` | 0 |
| `z-10` | 10 |
| `z-20` | 20 |
| `z-30` | 30 |
| `z-40` | 40 |
| `z-50` | 50 |
| `z-auto` | auto |

For custom values, use arbitrary values:
- `z-[60]` = z-index: 60
- `z-[100]` = z-index: 100
- `z-[9999]` = z-index: 9999

### Example: Increase Hamburger Button Z-Index

**Before:**
```tsx
className="fixed top-4 left-4 z-[60] xl:hidden"
```

**After (higher z-index):**
```tsx
className="fixed top-4 left-4 z-[100] xl:hidden"
```

---

## Windows PowerShell Commands

### Find all z-index usages in the codebase:
```powershell
cd melitech_crm
Get-ChildItem -Recurse -Include *.tsx,*.ts,*.css | Select-String -Pattern "z-\[?\d+\]?|z-index"
```

### Find z-index in specific component files:
```powershell
Select-String -Path ".\client\src\components\MaterialTailwind\*.tsx" -Pattern "z-\[?\d+\]?"
```

### Replace z-index value (example: change z-[60] to z-[100]):
```powershell
(Get-Content ".\client\src\components\MaterialTailwind\DashboardNavbar.tsx") -replace 'z-\[60\]', 'z-[100]' | Set-Content ".\client\src\components\MaterialTailwind\DashboardNavbar.tsx"
```

---

## Common Z-Index Issues and Solutions

### Issue: Hamburger icon hidden behind sidebar
**Solution:** Increase hamburger button z-index above sidebar z-index

```tsx
// Hamburger: z-[60] (must be higher than sidebar)
// Sidebar: z-50
```

### Issue: Dropdown menus appear behind other elements
**Solution:** Radix UI dropdowns use z-50 by default. Ensure parent containers don't have higher z-index.

### Issue: Modal/Dialog hidden behind sidebar
**Solution:** Most modal libraries use z-[9999] or similar. If issues persist, lower sidebar z-index or increase modal z-index.

---

## Hamburger Button Positioning

The hamburger button uses fixed positioning with dynamic left offset:

```tsx
className={cn(
  "fixed top-4 left-4 z-[60] xl:hidden",
  // When sidebar is open, move button to the right
  openSidenav ? "left-[280px]" : "left-4"
)}
```

### To adjust button position:

| Property | Current Value | Description |
|----------|---------------|-------------|
| `top-4` | 16px from top | Vertical position |
| `left-4` | 16px from left | Horizontal position (closed) |
| `left-[280px]` | 280px from left | Horizontal position (open) |

### Example: Move button lower and further right:
```tsx
"fixed top-6 left-6 z-[60] xl:hidden"
```

---

## Rebuilding After Changes

After modifying z-index values:

```powershell
# Rebuild the application
pnpm build

# Or restart development server
pnpm dev
```

Then hard refresh your browser (Ctrl+Shift+R) to clear cached styles.

---

## Quick Reference: Key Files to Edit

| What to Change | File Path |
|----------------|-----------|
| Hamburger button z-index | `client\src\components\MaterialTailwind\DashboardNavbar.tsx` |
| Hamburger button position | `client\src\components\MaterialTailwind\DashboardNavbar.tsx` |
| Sidebar z-index | `client\src\components\MaterialTailwind\Sidenav.tsx` |
| Overlay z-index | `client\src\components\MaterialTailwind\Sidenav.tsx` |
| Navbar z-index | `client\src\components\MaterialTailwind\DashboardNavbar.tsx` |
