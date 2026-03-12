import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { getDashboardUrl } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { NotificationBell } from "./NotificationBell";
import { FloatingActionBar, QuickAccessItem } from "./FloatingActionBar";
import { FloatingAIChat } from "./FloatingAIChat";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  Receipt,
  DollarSign,
  Package,
  Briefcase,
  CreditCard,
  BarChart3,
  UserCog,
  Settings,
  ChevronDown,
  ChevronRight,
  Moon,
  Sun,
  User,
  Lock,
  Shield,
  LogOut,
  Menu,
  X,
  Building2,
  TrendingUp,
  Sparkles,
  Download,
  Inbox,
  ShoppingCart,
  PiggyBank,
  Wallet,
  MessageSquare,
  Mail,
  CheckSquare,
  Ticket,
  Clock,
  AlertCircle,
  Zap,
  Home,
  Palette,
  Layout,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href?: string;
  icon: any;
  badge?: number;
  children?: NavItem[];
  roles?: string[];
}

const getNavigation = (userRole?: string): NavItem[] => [
    {
    title: "Admin",
    icon: Shield,
    roles: ["super_admin", "admin"],
    children: [
      { title: "Management", href: "/admin/management", icon: Shield },
      { title: "Approvals", href: "/approvals", icon: CheckSquare, roles: ["super_admin", "admin", "project_manager", "accountant"] },
    ],
  },
  {
    title: "Clients",
    href: "/clients",
    icon: Users,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Sales",
    icon: TrendingUp,
    children: [
      { title: "Estimates", href: "/estimates", icon: FileText },
      { title: "Opportunities", href: "/opportunities", icon: Briefcase },
      { title: "Receipts", href: "/receipts", icon: Receipt },
    ],
  },
  {
    title: "Accounting",
    icon: CreditCard,
    children: [
      { title: "Invoices", href: "/invoices", icon: FileText },
      { title: "Payments", href: "/payments", icon: DollarSign },
      { title: "Payment Reports", href: "/payments/reports", icon: BarChart3 },
      { title: "Overdue Payments", href: "/payments/overdue", icon: DollarSign },
      { title: "Expenses", href: "/expenses", icon: Receipt },
      { title: "Chart of Accounts", href: "/chart-of-accounts", icon: BarChart3 },
      { title: "Bank Reconciliation", href: "/bank-reconciliation", icon: Wallet },
      { title: "Budgets", href: "/budgets", icon: PiggyBank },
    ],
  },
  {
    title: "Products & Services",
    icon: Package,
    children: [
      { title: "Products", href: "/products", icon: Package },
      { title: "Services", href: "/services", icon: Briefcase },
    ],
  },
  {
    title: "HR",
    icon: UserCog,
    children: [
      { title: "Employees", href: "/employees", icon: Users },
      { title: "Attendance", href: "/attendance", icon: Users },
      { title: "Payroll", href: "/payroll", icon: DollarSign },
      { title: "Leave Management", href: "/leave-management", icon: Users },
      { title: "Departments", href: "/departments", icon: Building2 },
    ],
  },
  {
    title: "Procurement",
    icon: ShoppingCart,
    children: [
      { title: "Suppliers", href: "/suppliers", icon: ShoppingCart },
      { title: "LPOs", href: "/lpos", icon: ShoppingCart },
      { title: "Orders", href: "/orders", icon: Inbox },
      { title: "Imprests", href: "/imprests", icon: Wallet },
      { title: "Inventory & Stocks", href: "/inventory", icon: Package },
    ],
  },
  {
    title: "Support & Communications",
    icon: MessageSquare,
    children: [
      { title: "Communications", href: "/communications", icon: Mail },
      { title: "Tickets", href: "/tickets", icon: Ticket },
      { title: "Notifications", href: "/notifications", icon: AlertCircle },
      { title: "AI Assistant", href: "/ai-hub", icon: Zap },
    ],
  },
  {
    title: "Reports",
    icon: BarChart3,
    children: [
      { title: "All Reports", href: "/reports", icon: BarChart3 },
      { title: "Sales Reports", href: "/reports/sales", icon: TrendingUp },
      { title: "Financial Reports", href: "/financial-dashboard", icon: CreditCard },
    ],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Tools",
    icon: Zap,
    children: [
      { title: "Import Data", href: "/import-excel", icon: Download, roles: ["super_admin", "admin"] },
      { title: "Brand Customization", href: "/tools/brand-customization", icon: Palette, roles: ["super_admin", "admin"] },
      { title: "Homepage Builder", href: "/tools/homepage-builder", icon: Layout },
    ],
  },

].filter(item => {
  // If no roles specified, show to everyone
  if (!item.roles) return true;
  // Otherwise, only show if user role matches
  return item.roles.includes(userRole || "");
});

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
  user?: any;
  onLogout?: () => Promise<void> | void;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Load sidebar state from localStorage
    const saved = localStorage.getItem('sidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location === href || location.startsWith(href + "/");
  };

  const hasActiveChild = (item: NavItem) => {
    return item.children?.some((child) => isActive(child.href));
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Keyboard shortcut for sidebar toggle (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSidebarOpen((prev: boolean) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Persist sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="relative">
                <img
                  src={APP_LOGO}
                  alt={APP_TITLE}
                  className="h-20 w-20 rounded-xl object-cover shadow-lg"
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">{APP_TITLE}</h1>
              <p className="text-sm text-muted-foreground">
                Please sign in to continue
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Sign in to Continue
          </Button>
        </div>
      </div>
    );
  }

  const renderNavItem = (item: NavItem, level = 0) => {
    const Icon = item.icon;
    const isExpanded = expandedItems.includes(item.title);
    
    // Filter children based on role
    const visibleChildren = item.children?.filter((child) => {
      if (!child.roles) return true; // Show if no roles specified
      return child.roles.includes(user?.role || "");
    }) || [];
    
    const hasChildren = visibleChildren.length > 0;
    const isItemActive = isActive(item.href) || visibleChildren.some((child) => isActive(child.href));

    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleExpanded(item.title)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isItemActive && "bg-accent text-accent-foreground font-medium",
              level > 0 && "pl-8",
              "text-slate-900 dark:text-slate-100"
            )}
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="h-4 w-4" />}
              <span>{item.title}</span>
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && visibleChildren.length > 0 && (
            <div className="mt-1 space-y-1">
              {visibleChildren.map((child) => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.title}
        onClick={() => item.href && navigate(item.href)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          isItemActive && "bg-primary text-primary-foreground font-medium",
          level > 0 && "pl-8",
          "text-slate-900 dark:text-slate-100"
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span>{item.title}</span>
        {item.badge && (
          <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
    <div className="min-h-screen bg-background">
      {/* 
        HAMBURGER MENU BUTTON - Fixed Position
        Z-INDEX: z-[60] ensures it's always above the sidebar (z-50)
        File: client/src/components/DashboardLayout.tsx
      */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={cn(
          "fixed top-3 z-[60] transition-all duration-300 shadow-lg h-9 w-9 sm:h-10 sm:w-10 p-1.5 sm:p-2 lg:hidden",
          "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
          "hover:bg-slate-100 dark:hover:bg-slate-700",
          sidebarOpen ? "left-[calc(16rem+0.75rem)] sm:left-[calc(18rem+0.75rem)]" : "left-3 sm:left-4"
        )}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {sidebarOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
      </Button>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - z-50 is below hamburger button z-[60] */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen transition-all duration-300 border-r bg-card overflow-hidden",
          "w-64 md:w-72 lg:translate-x-0",
          sidebarOpen ? "translate-x-0 shadow-lg" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 sm:h-16 items-center gap-2 border-b px-3 sm:px-4 flex-shrink-0">
            <button
              onClick={() => navigate(getDashboardUrl(user?.role || "staff"))}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity w-full min-w-0"
              title="Back to Home"
            >
              <img src={APP_LOGO} alt={APP_TITLE} className="h-8 sm:h-10 rounded flex-shrink-0" />
              <span className="font-semibold text-xs sm:text-sm truncate">{APP_TITLE}</span>
            </button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-2 sm:px-3 py-3 sm:py-4">
            <nav className="space-y-0.5 sm:space-y-1">{getNavigation(user?.role).map((item) => renderNavItem(item))}</nav>
          </ScrollArea>

          {/* User Profile */}
          <div className="border-t p-3 sm:p-4 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-lg hover:bg-accent transition-colors min-w-0">
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
                    <AvatarImage src={user?.email || undefined} />
                    <AvatarFallback className="text-xs">{getInitials(user?.name || undefined)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs sm:text-sm font-medium truncate">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email || "No email"}</p>
                  </div>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sm:w-56">
                <DropdownMenuLabel className="text-xs sm:text-sm">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")} className="text-xs sm:text-sm">
                  <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/account")} className="text-xs sm:text-sm">
                  <Settings className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/security")} className="text-xs sm:text-sm">
                  <Lock className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Password & Security</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/mfa")} className="text-xs sm:text-sm">
                  <Shield className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Two-Factor Auth</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleTheme} className="text-xs sm:text-sm">
                  {theme === "dark" ? (
                    <>
                      <Sun className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-red-600 text-xs sm:text-sm">
                  <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content - Account for fixed sidebar */}
      <div
        className={cn(
          "transition-all duration-300 flex flex-col min-h-screen",
          sidebarOpen ? "ml-64 md:ml-72" : "ml-0 md:ml-0 lg:ml-72",  // Mobile: ml-64 when open, ml-0 when closed. Desktop (lg+): always ml-72 (matches sidebar md:w-72)
        )}
      >
        {/* Header - z-30 is below sidebar and hamburger */}
        <header className="sticky top-0 z-30 flex h-12 sm:h-16 items-center gap-2 sm:gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 sm:px-4 md:px-6 flex-shrink-0">
          {/* Spacer for fixed hamburger button */}
          <div className="w-9 sm:w-10" />

          {/* Home Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 sm:h-10 sm:w-10 text-slate-900 dark:text-slate-100"
            onClick={() => navigate("/crm")}
            title="Go to home page"
          >
            <Home className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <div className="flex-1" />

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 text-slate-900 dark:text-slate-100" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </Button>

          {/* Notifications */}
          <NotificationBell />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full p-0">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                  <AvatarImage src={user?.email || undefined} />
                  <AvatarFallback className="text-xs sm:text-sm">{getInitials(user?.name || undefined)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 sm:w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-0.5 sm:space-y-1">
                  <p className="text-xs sm:text-sm font-medium truncate text-slate-900 dark:text-slate-100">{user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || "No email"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")} className="text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")} className="text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                <Settings className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="text-red-600 dark:text-red-400 text-xs sm:text-sm">
                <LogOut className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content - Responsive Padding */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
    
    {/* Floating AI Chat */}
    <FloatingAIChat />
    
    {/* Floating Action Bar with Quick Access */}
    <FloatingActionBar position="right" />
    </>
  );
}

