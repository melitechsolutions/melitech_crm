# Design System Quick Reference Guide

## Overview
The unified design system provides consistent styling across the entire CRM application with support for both light and dark modes.

---

## Quick Start: Using the Design System

### 1. Import the Design System
```typescript
import { 
  getGradientCard, 
  getStatusColor, 
  getBadgeColor,
  layouts,
  animations,
  spacing,
  shadows,
  typography
} from "@/lib/designSystem";
```

### 2. Apply Gradient Card Styling
```typescript
// Blue gradient (default for primary/info)
<Card className={getGradientCard("blue")}>
  Content here
</Card>

// Available colors: "blue", "emerald", "purple", "orange", "pink", "slate"
```

### 3. Use Status Colors
```typescript
<Icon className={getStatusColor("success")} />   // ✅ Emerald
<Icon className={getStatusColor("warning")} />   // ⚠️ Orange
<Icon className={getStatusColor("error")} />     // ❌ Red
<Icon className={getStatusColor("info")} />      // ℹ️ Blue
<Icon className={getStatusColor("neutral")} />   // ○ Slate
```

### 4. Use Badge Colors
```typescript
<Badge className={getBadgeColor("success")}>Success</Badge>
<Badge className={getBadgeColor("warning")}>Warning</Badge>
<Badge className={getBadgeColor("danger")}>Danger</Badge>
<Badge className={getBadgeColor("info")}>Info</Badge>
```

### 5. Preset Layouts
```typescript
// Dashboard grid (responsive: 1col → 2col → 3col → 4col)
<div className={layouts.dashboardGrid}>
  {items}
</div>

// Wide grid for detailed cards
<div className={layouts.dashboardGridWide}>
  {items}
</div>

// Page container with consistent spacing
<div className={layouts.pageContainer}>
  {content}
</div>

// Card content padding
<div className={layouts.cardContainer}>
  {content}
</div>
```

### 6. Animations
```typescript
<CardTitle className={animations.fadeIn}>Title</CardTitle>
<div className={animations.slideIn}>Content</div>
<div className={animations.pulse}>Loading</div>
<div className={animations.spin}>Processing</div>
```

---

## Color Scheme Examples

### Using Each Color Scheme

```typescript
// Blue - Primary/Info/Default
<Card className={getGradientCard("blue")}>
  Primary action or information

// Emerald - Success/Positive
<Card className={getGradientCard("emerald")}>
  Success metrics, completed items

// Purple - Secondary/Special
<Card className={getGradientCard("purple")}>
  Secondary actions, highlights

// Orange - Warning/Attention
<Card className={getGradientCard("orange")}>
  Warnings, attention needed

// Pink - Special/Notifications
<Card className={getGradientCard("pink")}>
  Special alerts, notifications

// Slate - Neutral/Data
<Card className={getGradientCard("slate")}>
  Data tables, neutral content
```

---

## Dark Mode Support

All components automatically support dark mode through tailwind CSS.

### Dark Mode Colors
```typescript
// Light Mode (Default)
background: 'hsl(0 0% 100%)'
foreground: 'hsl(0 0% 3.6%)'
card: 'hsl(0 0% 100%)'

// Dark Mode (Automatic)
background: 'hsl(0 0% 3.6%)'
foreground: 'hsl(0 0% 98%)'
card: 'hsl(0 0% 8.6%)'
```

No additional code needed - tailwind dark: prefix handles it.

---

## Real-World Examples

### Example 1: Dashboard Card
```typescript
import { getGradientCard, animations } from "@/lib/designSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RevenueCard() {
  return (
    <Card className={getGradientCard("emerald")}>
      <CardHeader>
        <CardTitle className={animations.fadeIn}>Total Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">KES 150,000</div>
        <p className="text-sm text-muted-foreground">+12% from last month</p>
      </CardContent>
    </Card>
  );
}
```

### Example 2: Metric Grid
```typescript
import { getGradientCard, layouts } from "@/lib/designSystem";

export function MetricsGrid() {
  const metrics = [
    { label: "Active Jobs", value: 5, scheme: "blue" },
    { label: "Completed", value: 142, scheme: "emerald" },
    { label: "Failed", value: 3, scheme: "orange" },
    { label: "Pending", value: 8, scheme: "purple" },
  ];

  return (
    <div className={layouts.dashboardGrid}>
      {metrics.map((metric) => (
        <Card key={metric.label} className={getGradientCard(metric.scheme)}>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground">
              {metric.label}
            </h3>
            <p className="text-2xl font-bold mt-2">{metric.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Example 3: Status Badge Row
```typescript
import { Badge } from "@/components/ui/badge";
import { getBadgeColor, getStatusColor } from "@/lib/designSystem";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function StatusRow() {
  return (
    <div className="flex gap-3">
      <Badge className={getBadgeColor("success")}>
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Success
      </Badge>
      <Badge className={getBadgeColor("warning")}>
        <AlertCircle className={`w-3 h-3 mr-1 ${getStatusColor("warning")}`} />
        Warning
      </Badge>
    </div>
  );
}
```

---

## Component Patterns

### Pattern 1: Data Card with Icon
```typescript
interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  colorScheme: "blue" | "emerald" | "purple" | "orange" | "pink" | "slate";
}

function MetricCard({
  title,
  value,
  description,
  icon,
  colorScheme,
}: MetricCardProps) {
  return (
    <Card className={getGradientCard(colorScheme)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          {title}
          {icon}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
```

### Pattern 2: Status Table Row
```typescript
function StatusRow({ status, variant }: { status: string; variant: string }) {
  return (
    <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20">
      <Badge className={getBadgeColor(variant)}>
        {status}
      </Badge>
    </div>
  );
}
```

### Pattern 3: Section with Title and Grid
```typescript
function DashboardSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Overview</h2>
        <p className="text-muted-foreground">Key metrics for this period</p>
      </div>
      <div className={layouts.dashboardGrid}>
        {/* Grid items */}
      </div>
    </div>
  );
}
```

---

## Typography Styles

```typescript
import { typography } from "@/lib/designSystem";

<h1 className={typography.h1}>Heading 1</h1>
<h2 className={typography.h2}>Heading 2</h2>
<h3 className={typography.h3}>Heading 3</h3>
<h4 className={typography.h4}>Heading 4</h4>
<p className={typography.body}>Body text</p>
<Label className={typography.label}>Label text</Label>
<p className={typography.caption}>Caption text</p>
```

---

## Spacing System

```typescript
import { spacing } from "@/lib/designSystem";

// Predefined spacing values
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 2.5rem (40px)

// Usage with tailwind
<div className="space-y-4">  // 16px gap
<div className="gap-6">     // 24px gap
<div className="p-4">       // 16px padding
```

---

## Shadow Levels

```typescript
import { shadows } from "@/lib/designSystem";

<Card className={shadows.sm}>   // Subtle shadow
<Card className={shadows.md}>   // Medium shadow
<Card className={shadows.lg}>   // Large shadow
<Card className={shadows.xl}>   // Extra large shadow
<Card className={shadows['2xl']}>  // Extra extra large shadow
```

---

## Common Use Cases

### Case 1: Financial Dashboard
```typescript
// Use emerald for positive metrics, orange for warnings
const Dashboard = () => {
  return (
    <div className={layouts.pageContainer}>
      <div className={layouts.dashboardGrid}>
        <Card className={getGradientCard("emerald")}>Revenue</Card>
        <Card className={getGradientCard("emerald")}>Income</Card>
        <Card className={getGradientCard("orange")}>Outstanding</Card>
        <Card className={getGradientCard("orange")}>Overdue</Card>
      </div>
    </div>
  );
};
```

### Case 2: Status Monitoring
```typescript
// Use colors based on actual status
const StatusMonitor = () => {
  const status = getCurrentStatus(); // "healthy" | "degraded" | "critical"
  
  return (
    <Card className={
      status === "healthy" ? getGradientCard("emerald") :
      status === "degraded" ? getGradientCard("orange") :
      getGradientCard("pink")
    }>
      Health Status
    </Card>
  );
};
```

### Case 3: Data Table
```typescript
// Use slate gradient for neutral table appearance
const DataTable = () => {
  return (
    <Card className={getGradientCard("slate")}>
      <Table>
        {/* Table content */}
      </Table>
    </Card>
  );
};
```

---

## Best Practices

✅ **DO:**
- Use consistent color schemes across similar components
- Apply animations to enhance UX, not distract
- Use appropriate status colors for user feedback
- Respect dark mode support

❌ **DON'T:**
- Mix multiple color schemes on the same page
- Overuse animations
- Change colors randomly
- Ignore dark mode compatibility

---

## Troubleshooting

### Colors not showing correctly
- [ ] Ensure tailwind CSS is properly configured
- [ ] Check if dark mode class is applied to root element
- [ ] Verify import path is correct

### Animations not playing
- [ ] Check tailwind animation config
- [ ] Ensure CSS is compiled
- [ ] Verify animation classes are correct

### Gradient cards look flat
- [ ] Enable dark mode to see contrast
- [ ] Check browser CSS support
- [ ] Verify tailwind version compatibility

---

## Migration Guide

### Upgrading from old style system to new Design System

```typescript
// Old Way
<Card className="bg-blue-50 border-blue-200">
  <CardTitle>Title</CardTitle>
</Card>

// New Way
<Card className={getGradientCard("blue")}>
  <CardTitle>Title</CardTitle>
</Card>
```

### Benefits of migration
- Consistent styling across app
- Automatic dark mode support
- Reduced CSS code
- Easier maintenance
- Better hover effects

---

## Version History

- **v1.0** - Initial release with 6 color schemes, dark mode support
- Upcoming: Theme customization, additional layouts

---

**Last Updated:** Current Session
**Maintained By:** Development Team
**Questions?** Check the design system source file: `client/src/lib/designSystem.ts`
