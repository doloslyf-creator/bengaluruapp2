import { useLocation } from "wouter";
import { Link } from "wouter";
import { useState } from "react";
import { 
  Home, 
  BarChart3, 
  Users2, 
  MapPin, 
  FileText, 
  Building2, 
  UserCheck,

  Settings,
  ArrowLeft,
  ShoppingCart,
  Calculator,
  Calendar,
  Star,
  Shield,
  Bell,
  ChevronDown,
  ChevronRight,
  Users,
  Briefcase,
  FileSpreadsheet,
  Target,
  TrendingUp,
  Hammer,
  Zap,
  Factory,
  Database,
  Archive,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/auth/SignOutButton";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  description: string;
}

interface NavigationGroup {
  name: string;
  icon: any;
  items: NavigationItem[];
}

const singleNavigation: NavigationItem[] = [
  { 
    name: "Dashboard", 
    href: "/admin-panel", 
    icon: Home,
    description: "Overview & Analytics"
  },

  { 
    name: "Orders", 
    href: "/admin-panel/orders", 
    icon: ShoppingCart,
    description: "Order Management"
  },
  { 
    name: "Notifications", 
    href: "/admin-panel/notifications", 
    icon: Bell,
    description: "Notification Management"
  },
  { 
    name: "RERA Management", 
    href: "/admin-panel/rera-management", 
    icon: Shield,
    description: "RERA Compliance & Verification"
  },
  { 
    name: "Settings", 
    href: "/admin-panel/settings", 
    icon: Settings,
    description: "App Configuration"
  },
  {
    name: "Database Migration",
    href: "/admin-panel/supabase-migration", 
    icon: Database,
    description: "Migrate to Supabase"
  },
  { 
    name: "Backup System", 
    href: "/admin-panel/backup-system", 
    icon: Archive,
    description: "Data Backup & Recovery"
  },
];

const groupedNavigation: NavigationGroup[] = [
  {
    name: "Customer Relations",
    icon: Users,
    items: [
      { 
        name: "Customers", 
        href: "/admin-panel/customers", 
        icon: Users2,
        description: "Customer CRM"
      },
      { 
        name: "Developers", 
        href: "/admin-panel/developers", 
        icon: Factory,
        description: "Developer Directory"
      },
      { 
        name: "Team Management", 
        href: "/admin-panel/team-management", 
        icon: Briefcase,
        description: "Manage Team Members"
      },
      { 
        name: "Enhanced Leads", 
        href: "/admin-panel/enhanced-leads", 
        icon: Target,
        description: "Advanced Lead Management & Analytics"
      },
      { 
        name: "Site Visit Bookings", 
        href: "/admin-panel/bookings", 
        icon: Calendar,
        description: "Manage Property Visit Schedules"
      },
    ]
  },
  {
    name: "Reports",
    icon: FileSpreadsheet,
    items: [

      { 
        name: "Civil+MEP Reports", 
        href: "/admin-panel/civil-mep-reports", 
        icon: Wrench,
        description: "Engineering Assessments"
      },
      { 
        name: "Valuation Reports", 
        href: "/admin-panel/valuation-reports", 
        icon: TrendingUp,
        description: "Property Valuation Analysis"
      },


      { 
        name: "Property Scoring", 
        href: "/admin-panel/property-scoring", 
        icon: Target,
        description: "Property Evaluation & Scoring"
      },
      { 
        name: "Analytics", 
        href: "/admin-panel/analytics", 
        icon: TrendingUp,
        description: "Data & Insights"
      },
    ]
  },
  {
    name: "Property Management",
    icon: Building2,
    items: [
      { 
        name: "Properties", 
        href: "/admin-panel/properties", 
        icon: Building2,
        description: "Manage Property Listings"
      },
      { 
        name: "Zones", 
        href: "/admin-panel/zones", 
        icon: MapPin,
        description: "Location Management"
      },
    ]
  }
];

export function AdminLayout({ children, title, showBackButton = false, backUrl = "/admin-panel" }: AdminLayoutProps) {
  const [location] = useLocation();
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['Customer Relations', 'Reports', 'Property Management']));

  const isActive = (href: string) => {
    if (href === "/admin-panel") {
      return location === href;
    }
    return location.startsWith(href);
  };

  const getCurrentPageName = () => {
    // Check single navigation items
    const singleNav = singleNavigation.find(nav => isActive(nav.href));
    if (singleNav) return singleNav.name;

    // Check grouped navigation items
    for (const group of groupedNavigation) {
      const groupNav = group.items.find(nav => isActive(nav.href));
      if (groupNav) return groupNav.name;
    }
    
    return "Admin Panel";
  };

  const toggleGroup = (groupName: string) => {
    const newOpenGroups = new Set(openGroups);
    if (newOpenGroups.has(groupName)) {
      newOpenGroups.delete(groupName);
    } else {
      newOpenGroups.add(groupName);
    }
    setOpenGroups(newOpenGroups);
  };

  const isGroupActive = (group: NavigationGroup) => {
    return group.items.some(item => isActive(item.href));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85 shadow-sm">
        <div className="flex h-16 items-center px-6">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <div className="flex flex-col">
                <div className="flex flex-col">
                  <div className="text-lg font-black tracking-tight text-gray-900">
                    Own<span className="text-orange-500">It</span><span className="text-blue-600">Right</span>
                  </div>
                  <span className="text-xs text-gray-500 -mt-1">Curated Properties • Admin Panel</span>
                </div>
              </div>
            </div>
          </div>

          {/* Page Title & Back Button */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              {showBackButton && (
                <Button variant="ghost" size="sm" asChild>
                  <Link href={backUrl}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Link>
                </Button>
              )}
              {title && (
                <>
                  {showBackButton && <Separator orientation="vertical" className="h-6" />}
                  <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                </>
              )}
            </div>
          </div>

          {/* Customer Site Link & Authentication */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                View Site
              </Link>
            </Button>
            <SignOutButton variant="ghost" size="sm" />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 shadow-sm">
          <div className="h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Navigation */}
            <nav className="p-4 space-y-2">
              {/* Single Navigation Items */}
              {singleNavigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      active
                        ? "bg-primary text-white shadow-lg shadow-primary/25"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 transition-colors ${
                        active ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${active ? "text-white/80" : "text-gray-500"}`}>
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Add separator */}
              <div className="my-3">
                <Separator />
              </div>

              {/* Grouped Navigation Items */}
              {groupedNavigation.map((group) => {
                const isOpen = openGroups.has(group.name);
                const groupActive = isGroupActive(group);
                
                return (
                  <div key={group.name} className="space-y-1">
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroup(group.name)}
                      className={`group w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        groupActive
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <group.icon
                        className={`mr-3 h-5 w-5 transition-colors ${
                          groupActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
                        }`}
                      />
                      <div className="flex-1 text-left">
                        <div className="font-semibold">{group.name}</div>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 transition-transform" />
                      ) : (
                        <ChevronRight className="h-4 w-4 transition-transform" />
                      )}
                    </button>

                    {/* Group Items */}
                    {isOpen && (
                      <div className="ml-6 space-y-1">
                        {group.items.map((item) => {
                          const active = isActive(item.href);
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={`group flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                active
                                  ? "bg-primary text-white shadow-md"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              <item.icon
                                className={`mr-3 h-4 w-4 transition-colors ${
                                  active ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                                }`}
                              />
                              <div className="flex-1">
                                <div className="font-medium">{item.name}</div>
                                <div className={`text-xs ${active ? "text-white/80" : "text-gray-500"}`}>
                                  {item.description}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 mt-auto border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Settings className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-gray-900">Admin Status</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Online
                  </Badge>
                  <span className="text-xs text-gray-600">System Active</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-[calc(100vh-4rem)] overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;