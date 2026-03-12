# Unified Landing Page - Visual Layout Guide

## Page Structure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        UNIFIED LANDING PAGE                      │
│                    (/dashboard)                                  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ SECTION 1: WELCOME HEADER                                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  🏆 System Overview  (Role-specific icon + greeting)           │
│     Welcome back, [User Name]. Monitor all operations...       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ SECTION 2: QUICK ACTIONS (Grid Layout)                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────┐ │
│  │ 👥 Clients  │  │ 📁 Projects │  │ 📄 Invoices │  │ 💳   │ │
│  │ Manage      │  │ Track       │  │ Create &    │  │Payment│ │
│  │ relationships│  │ progress    │  │ manage      │  │ Track │ │
│  │ ─────────── │  │ ─────────── │  │ ─────────── │  │───────│ │
│  │ Active: 5   │  │ Total: 12   │  │ Pending: 3  │  │ KES  │ │
│  │             │  │             │  │             │  │500K  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────┘ │
│                                                                  │
│  [Additional role-specific cards]                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ SECTION 3: KEY METRICS (At-a-glance View)                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │ 📁 Total Projects│  │ 👥 Active Clients│                     │
│  │ 12               │  │ 5                │                     │
│  │ In progress      │  │ Client relations │                     │
│  └──────────────────┘  └──────────────────┘                     │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │ 📄 Pending       │  │ 📈 Monthly       │                     │
│  │ Invoices         │  │ Revenue          │                     │
│  │ 3                │  │ KES 500,000      │                     │
│  │ Awaiting payment │  │ This month       │                     │
│  └──────────────────┘  └──────────────────┘                     │
│                                                                  │
│  [Additional role-specific metrics]                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ SECTION 4: GETTING STARTED (Tips & Resources)                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────┐    │
│  │ ⚡ Pro Tips               │  │ 🕐 Quick Access         │    │
│  ├──────────────────────────┤  ├──────────────────────────┤    │
│  │ Streamline financial     │  │ [View Reports Button]   │    │
│  │ management by setting    │  │ [Settings Button]       │    │
│  │ up recurring invoices    │  │                          │    │
│  │ and automated reminders. │  │                          │    │
│  └──────────────────────────┘  └──────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ SECTION 5: SYSTEM STATUS (Super Admin Only)                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Operational Health                                             │
│                                                                  │
│  ✓ Database          Connected                                 │
│  ✓ API Server        Running                                     │
│  ✓ Services          All Active                                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Quick Action Card Design

```
┌────────────────────────────┐
│ ┌─────┐    ← Icon Box      │ ← Gradient Background (on hover)
│ │ 👥  │                    │
│ └─────┘                    │
│ Title                      │  ← Bold Font
│ Description text...        │  ← Lighter Font
│ ─────────────────────────  │  ← Border Separator
│ Label: Value               │  ← Stats Display
│                  →→ →→      │  ← Arrow on Hover
└────────────────────────────┘
```

**Hover State:**
- Slight shadow elevation
- Border color brightens
- Background gradient appears
- Arrow icon becomes visible

## Responsive Behavior

### Mobile (< 768px)
```
Full width cards stacked vertically

┌────────────────┐
│   Card 1       │
└────────────────┘
┌────────────────┐
│   Card 2       │
└────────────────┘
┌────────────────┐
│   Card 3       │
└────────────────┘
```

### Tablet (768px - 1024px)
```
2-column grid for quick actions
2-column grid for metrics

┌─────────┬─────────┐
│ Card 1  │ Card 2  │
├─────────┼─────────┤
│ Card 3  │ Card 4  │
└─────────┴─────────┘
```

### Desktop (1024px - 1536px)
```
3-column grid for quick actions
4-column grid for metrics

┌─────────┬─────────┬─────────┐
│ Card 1  │ Card 2  │ Card 3  │
├─────────┼─────────┼─────────┤
│ Card 4  │ Card 5  │ Card 6  │
└─────────┴─────────┴─────────┘

┌────────┬────────┬────────┬────────┐
│ Met 1  │ Met 2  │ Met 3  │ Met 4  │
└────────┴────────┴────────┴────────┘
```

### Large Desktop (> 1536px)
```
5-column grid for quick actions
4-column grid for metrics

┌────────┬────────┬────────┬────────┬────────┐
│ Card 1 │ Card 2 │ Card 3 │ Card 4 │ Card 5 │
└────────┴────────┴────────┴────────┴────────┘
```

## Color Palette

### Quick Action Card Colors (Gradients)

| Action | Primary | Secondary | Brand Color |
|--------|---------|-----------|-------------|
| Clients | Blue 500 | Blue 600 | `from-blue-500 to-blue-600` |
| Projects | Green 500 | Green 600 | `from-green-500 to-green-600` |
| Invoices | Purple 500 | Purple 600 | `from-purple-500 to-purple-600` |
| Payments | Emerald 500 | Emerald 600 | `from-emerald-500 to-emerald-600` |
| Expenses | Orange 500 | Orange 600 | `from-orange-500 to-orange-600` |
| Accounting | Pink 500 | Pink 600 | `from-pink-500 to-pink-600` |
| Budgets | Indigo 500 | Indigo 600 | `from-indigo-500 to-indigo-600` |
| Employees | Cyan 500 | Cyan 600 | `from-cyan-500 to-cyan-600` |
| Payroll | Lime 500 | Lime 600 | `from-lime-500 to-lime-600` |
| Attendance | Rose 500 | Rose 600 | `from-rose-500 to-rose-600` |
| Admin | Red 500 | Red 600 | `from-red-500 to-red-600` |
| Reports | Amber 500 | Amber 600 | `from-amber-500 to-amber-600` |

### Metric Card Border Colors

| Metric | Border | Background |
|--------|--------|------------|
| Projects | Blue 500 | `bg-blue-50` (light) / `dark:bg-blue-900/20` (dark) |
| Clients | Green 500 | `bg-green-50` / `dark:bg-green-900/20` |
| Invoices | Purple 500 | `bg-purple-50` / `dark:bg-purple-900/20` |
| Revenue | Emerald 500 | `bg-emerald-50` / `dark:bg-emerald-900/20` |
| Expenses | Orange 500 | `bg-orange-50` / `dark:bg-orange-900/20` |
| Employees | Cyan 500 | `bg-cyan-50` / `dark:bg-cyan-900/20` |

## Light & Dark Mode Support

### Light Mode
- White cards with light borders
- Dark text on light background
- Subtle shadows
- Light colored backgrounds

```
┌────────────────────────────┐
│ ✓ (Light BG)               │ ← White/Light Gray
│ Title                      │ ← Black/Dark Gray
│ Description text           │ ← Medium Gray
│ ─────────────────────────  │ ← Light Border
│ Stats: 123                 │ ← Dark Text
└────────────────────────────┘
```

### Dark Mode
- Dark cards with darker borders
- Light text on dark background
- Prominent shadows
- Dark colored backgrounds

```
┌────────────────────────────┐
│ ✓ (Dark BG)                │ ← Dark Gray/Slate 900
│ Title                      │ ← White/Light Gray
│ Description text           │ ← Medium Gray
│ ─────────────────────────  │ ← Dark Border
│ Stats: 123                 │ ← Light Text
└────────────────────────────┘
```

## Typography

### Hierarchy

**Primary (Welcome Section)**
- H1: 36px / 2.25rem (text-4xl)
- Font Weight: Bold (700)
- Line Height: 2.5rem
- Letter Spacing: -0.02em

**Secondary (Section Headers)**
- H2: 20px / 1.25rem (text-xl)
- Font Weight: Semi-bold (600)
- Line Height: 1.75rem

**Tertiary (Card Titles)**
- H3: 16px / 1rem
- Font Weight: Semi-bold (600)

**Body Text**
- Regular: 14px / 0.875rem
- Small: 12px / 0.75rem

## Spacing & Padding

```
Main Container
├── Top Padding: 2rem (8 units)
├── Section Vertical Gap: 2rem
├── Card Padding: 1.5rem (6 units)
├── Icon Box Padding: 0.75rem (3 units)
└── Icon Size: 32px (w-8 h-8)

Grid
├── Column Gap: 1rem (4 units)
└── Row Gap: 1rem (4 units)
```

## Interactive States

### Buttons & Cards

**Normal State**
- Border: `border-slate-200` (light) / `border-slate-700` (dark)
- Background: `bg-white` (light) / `bg-slate-900` (dark)
- Shadow: Subtle

**Hover State**
- Shadow: Elevated (lg)
- Border: `border-slate-300` (light) / `border-slate-600` (dark)
- Gradient: Faded (opacity-5)
- Cursor: pointer

**Active/Selected State**
- Border Width: Increased
- Background: Primary color with opacity
- Shadow: Maximum

## Role-Specific Welcome Messages

### Super Admin
```
🏆 System Overview
Welcome back, [Name]. Monitor all operations and system health.
```

### Accountant
```
💼 Financial Dashboard
Welcome back, [Name]. Track accounting and finances.
```

### HR Manager
```
👨‍💼 HR Management
Welcome back, [Name]. Manage employees and payroll.
```

### Project Manager
```
📊 Project Command Center
Welcome back, [Name]. Track projects and team performance.
```

### Staff
```
👤 Staff Dashboard
Welcome back, [Name]. View your tasks and projects.
```

### Client
```
🏢 Client Portal
Welcome back, [Name]. Access your projects and invoices.
```

## Accessibility Features

- **ARIA Labels:** All interactive elements have proper labels
- **Keyboard Navigation:** Full keyboard support (Tab, Enter)
- **Contrast:** AA WCAG compliance on all text
- **Focus Indicators:** Visible focus rings on keyboard navigation
- **Icon Labels:** Icons accompanied by text labels
- **Semantic HTML:** Proper heading hierarchy

## Animation & Transitions

```css
/* Hover Effects */
transition: all 0.3s ease-in-out

/* Specific Animations */
- Opacity: 150ms
- Shadow: 200ms
- Border: 150ms
- Transform: 200ms (on hover elevation)
```

## State Indicators

### Metric Values
- **Green** (Positive): Revenue, Active items, Completed tasks
- **Orange** (Warning): Pending items, Overdue
- **Red** (Critical): Errors, Issues

### System Status (Super Admin)
- **Green Dot** (✓): Online/Active
- **Yellow Dot** (⚠): Warning
- **Red Dot** (✗): Offline/Error

## Mobile-First Responsive Design

```javascript
// Breakpoints
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

// Grid columns by breakpoint
- Mobile: 1 column
- md: 2 columns
- lg: 3-4 columns
- xl: 4-5 columns
```

## Performance Optimizations

- **Lazy Loading:** Components load on demand
- **Image Optimization:** Icons are SVG (no images)
- **CSS**: Tailwind utilities (no extra CSS files)
- **Bundle Size:** Minimal component dependencies

## Browser Compatibility

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari: iOS 12+
- Mobile Chrome: Android 8+

## Summary

The Unified Landing Page provides a consistent, visually appealing interface that adapts to each user's role while maintaining design coherence. The responsive layout ensures excellent usability across all device sizes, and the color-coded system makes information easily scannable at a glance.
