# Melitech CRM - Logo and Branding Customization Guide

This guide explains how to customize the company logo and branding throughout the Melitech CRM application.

> **Note:** The logo and company name are now configured via environment variables. All components automatically use `APP_LOGO` and `APP_TITLE` from `client/src/const.ts`.

---

## Quick Logo Replacement

### Step 1: Replace the Logo File

The main logo file is located at:

```
client/public/logo.png
```

**To replace it:**

1. Prepare your new logo image (recommended size: 200x200px or larger, PNG format with transparent background)
2. Name your logo file `logo.png`
3. Replace the existing file:

**Windows PowerShell:**
```powershell
# Navigate to the public folder
cd melitech_crm\client\public

# Backup the old logo (optional)
Copy-Item logo.png logo_backup.png

# Copy your new logo (replace path with your logo location)
Copy-Item "C:\path\to\your\logo.png" logo.png -Force
```

---

## Logo Locations in Code

The logo and company name appear in several locations. Here's where to customize each:

### 1. Sidebar Logo (Main Navigation)

**File:** `client/src/components/MaterialTailwind/Sidenav.tsx`

**Lines 164-180:**
```tsx
<div className="flex items-center gap-2">
  {/* Logo Icon - Replace "M" with your logo */}
  <div
    className={cn(
      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white",
      "bg-gradient-to-br from-blue-600 to-blue-700"
    )}
  >
    M  {/* Change this letter or replace with <img> */}
  </div>
  {/* Company Name */}
  <span
    className={cn(
      "font-bold text-lg",
      sidenavType === "dark" ? "text-white" : "text-slate-900"
    )}
  >
    Melitech  {/* Change this to your company name */}
  </span>
</div>
```

**To use an image logo instead of the letter "M":**
```tsx
<div className="flex items-center gap-2">
  <img 
    src="/logo.png" 
    alt="Company Logo" 
    className="w-8 h-8 rounded-lg object-contain"
  />
  <span className={cn("font-bold text-lg", sidenavType === "dark" ? "text-white" : "text-slate-900")}>
    Your Company Name
  </span>
</div>
```

---

### 2. Document Forms (Invoices, Estimates, Receipts)

**File:** `client/src/components/forms/DocumentForm.tsx`

**Lines 174-184:**
```tsx
<div className="flex items-center justify-between mb-6">
  <div>
    <img src="/logo.png" alt="Melitech Solutions" className="h-12 mb-2" />
    <h1 className="text-3xl font-bold text-primary">{documentTitle}</h1>
  </div>
  <div className="text-right">
    <p className="text-sm text-muted-foreground">Melitech Solutions</p>
    <p className="text-sm text-muted-foreground">P.O. Box 12345-00100</p>
    <p className="text-sm text-muted-foreground">Nairobi, Kenya</p>
    <p className="text-sm text-muted-foreground">info@melitechsolutions.co.ke</p>
  </div>
</div>
```

**To customize:**
- Replace `"Melitech Solutions"` with your company name
- Update the address, P.O. Box, and email
- The logo image is loaded from `/logo.png`

---

### 3. Email Templates

**File:** `client/src/components/ActionModals.tsx`

**Lines 110-115:**
```tsx
const [subject, setSubject] = useState(
  `${itemType} ${itemNumber ? `#${itemNumber}` : ""} from Melitech Solutions`
);
const [message, setMessage] = useState(
  `Dear valued client,\n\nPlease find attached your ${itemType.toLowerCase()} ${
    itemNumber ? `#${itemNumber}` : ""
  }.\n\nThank you for your business!\n\nBest regards,\nMelitech Solutions Team`
);
```

**To customize:**
- Replace `"Melitech Solutions"` with your company name
- Update the email signature

---

### 4. Footer Branding

**Files:**
- `client/src/components/MaterialTailwind/CollapsibleSettingsSidebar.tsx`
- `client/src/components/MaterialTailwind/FloatingSettingsSidebar.tsx`

**Lines 179-183:**
```tsx
<div className="border-t border-slate-200 pt-6 mt-6">
  <p className="text-xs text-slate-500 text-center">
    Melitech CRM v1.0.0
  </p>
  <p className="text-xs text-slate-400 text-center mt-1">
    © 2025 Melitech Solutions
  </p>
</div>
```

**To customize:**
- Replace `"Melitech CRM"` with your app name
- Replace `"Melitech Solutions"` with your company name
- Update the year as needed

---

### 5. Dashboard Layout Logo

**File:** `client/src/components/DashboardLayout.tsx`

**Lines 290-293:**
```tsx
{/* Logo */}
<div className="flex h-16 items-center gap-2 border-b px-4">
  <button onClick={() => navigate("/")} className="flex items-center gap-2">
    {/* Add your logo here */}
  </button>
</div>
```

---

## Color Scheme Customization

The primary brand colors are defined using Tailwind CSS. To change the brand colors:

### Option 1: Update Tailwind Config

**File:** `tailwind.config.ts` or `tailwind.config.js`

Add custom colors:
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',  // Your primary brand color
          600: '#2563eb',
          700: '#1d4ed8',
        }
      }
    }
  }
}
```

### Option 2: Update CSS Variables

**File:** `client/src/index.css` or `client/src/globals.css`

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* HSL values for your brand color */
  --primary-foreground: 210 40% 98%;
}
```

---

## Sidebar Logo Gradient Colors

To change the sidebar logo background gradient:

**File:** `client/src/components/MaterialTailwind/Sidenav.tsx`

**Line 168:**
```tsx
"bg-gradient-to-br from-blue-600 to-blue-700"
```

Change to your brand colors:
```tsx
"bg-gradient-to-br from-green-600 to-green-700"  // Green theme
"bg-gradient-to-br from-purple-600 to-purple-700"  // Purple theme
"bg-gradient-to-br from-red-600 to-red-700"  // Red theme
```

---

## Complete Branding Checklist

Use this checklist when rebranding the application:

| Location | File | What to Change |
|----------|------|----------------|
| Sidebar Logo | `Sidenav.tsx` | Logo icon, company name |
| Document Header | `DocumentForm.tsx` | Logo image, company details |
| Email Templates | `ActionModals.tsx` | Company name in subject/body |
| Settings Footer | `CollapsibleSettingsSidebar.tsx` | App name, copyright |
| Settings Footer | `FloatingSettingsSidebar.tsx` | App name, copyright |
| Public Logo | `client/public/logo.png` | Replace image file |
| Page Title | `index.html` | `<title>` tag |
| Favicon | `client/public/favicon.ico` | Replace icon file |

---

## Windows PowerShell Commands

### Find all occurrences of "Melitech" in the codebase:
```powershell
cd melitech_crm
Get-ChildItem -Recurse -Include *.tsx,*.ts,*.html | Select-String -Pattern "Melitech"
```

### Replace "Melitech" with your company name:
```powershell
# Preview changes first
Get-ChildItem -Recurse -Include *.tsx,*.ts | ForEach-Object {
    (Get-Content $_.FullName) -replace 'Melitech', 'YourCompany' | Set-Content $_.FullName
}
```

### Copy new logo:
```powershell
Copy-Item "C:\path\to\your\logo.png" ".\client\public\logo.png" -Force
```

---

## After Making Changes

1. **Rebuild the application:**
```powershell
pnpm build
```

2. **Restart the development server:**
```powershell
pnpm dev
```

3. **Clear browser cache** to see the new logo (Ctrl+Shift+R or Cmd+Shift+R)
