import { ModuleLayout } from "@/components/ModuleLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  Palette,
  Layout,
  Settings,
  Zap,
  BookOpen,
  ArrowRight,
} from "lucide-react";

const TOOLS = [
  {
    id: "theme-customization",
    title: "Theme Customization",
    description: "Customize light & dark modes, card backgrounds, and theme presets for your application",
    icon: <Palette className="h-8 w-8" />,
    href: "/tools/theme-customization",
    color: "bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-950 dark:to-purple-900",
    badge: "NEW",
  },
  {
    id: "brand-customization",
    title: "Brand Customization",
    description: "Set company branding, colors, typography, and visual guidelines that integrate with your theme",
    icon: <Zap className="h-8 w-8" />,
    href: "/tools/brand-customization",
    color: "bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950 dark:to-blue-900",
  },
  {
    id: "homepage-builder",
    title: "Homepage Builder",
    description: "Customize your dashboard homepage with widgets and cards. Configure which modules appear on your dashboard",
    icon: <Layout className="h-8 w-8" />,
    href: "/tools/homepage-builder",
    color: "bg-gradient-to-br from-green-100 to-green-50 dark:from-green-950 dark:to-green-900",
  },
  {
    id: "system-settings",
    title: "System Settings",
    description: "Configure application-wide settings, permissions, and system preferences",
    icon: <Settings className="h-8 w-8" />,
    href: "/tools/system-settings",
    color: "bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-950 dark:to-orange-900",
  },
  {
    id: "integration-guides",
    title: "Integration Guides",
    description: "Documentation and guides for integrating brand settings into your codebase",
    icon: <BookOpen className="h-8 w-8" />,
    href: "/tools/integration-guides",
    color: "bg-gradient-to-br from-red-100 to-red-50 dark:from-red-950 dark:to-red-900",
  },
];

export default function Tools() {
  const [, navigate] = useLocation();

  return (
    <ModuleLayout
      title="Tools & Customization"
      description="Master control center for application customization, branding, and settings"
      icon={<Settings className="w-6 h-6" />}
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Tools" },
      ]}
    >
      <div className="space-y-8">
        {/* Overview Section */}
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-2xl">Customize Your Application</CardTitle>
            <CardDescription className="text-base">
              Manage themes, branding, and application settings in one unified control center
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white mb-1">🎨 Theme Engine</div>
                <p className="text-slate-600 dark:text-slate-400">
                  Create and manage light/dark mode themes with multiple preset variations
                </p>
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white mb-1">🏢 Brand Guide</div>
                <p className="text-slate-600 dark:text-slate-400">
                  Define your company brand identity and auto-apply colors throughout the app
                </p>
              </div>
              <div>
                <div className="font-semibold text-slate-900 dark:text-white mb-1">⚙️ Unified Control</div>
                <p className="text-slate-600 dark:text-slate-400">
                  All theme and branding changes instantly applied across the entire application
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tools Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Available Tools</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOOLS.map((tool) => (
              <Card
                key={tool.id}
                className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                  tool.disabled ? "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800" : ""
                }`}
                onClick={() => !tool.disabled && navigate(tool.href)}
              >
                <CardHeader>
                  <div className={`${tool.color} rounded-lg p-4 w-fit mb-4`}>
                    <div className="text-slate-700 dark:text-slate-300">
                      {tool.icon}
                    </div>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{tool.title}</CardTitle>
                      {tool.badge && (
                        <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-sm mt-2">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    variant={tool.disabled ? "outline" : "default"}
                    disabled={tool.disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      !tool.disabled && navigate(tool.href);
                    }}
                  >
                    {tool.disabled ? "Coming Soon" : "Open Tool"}
                    {!tool.disabled && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Links Section */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common customization tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => navigate("/tools/theme-customization")}
              >
                <div className="text-left">
                  <div className="font-semibold">Switch Theme Preset</div>
                  <div className="text-xs text-muted-foreground">Choose from dark, light, or custom themes</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => navigate("/tools/brand-customization")}
              >
                <div className="text-left">
                  <div className="font-semibold">Update Brand Colors</div>
                  <div className="text-xs text-muted-foreground">Customize your company brand identity</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => navigate("/tools/homepage-builder")}
              >
                <div className="text-left">
                  <div className="font-semibold">Customize Dashboard</div>
                  <div className="text-xs text-muted-foreground">Enable/disable widgets and rearrange layout</div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4 opacity-50 cursor-not-allowed"
                disabled
              >
                <div className="text-left">
                  <div className="font-semibold">Export Theme Configuration</div>
                  <div className="text-xs text-muted-foreground">Coming soon - download your theme as JSON</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ModuleLayout>
  );
}
