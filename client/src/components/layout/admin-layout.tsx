import { useLocation } from "wouter";
import { Link } from "wouter";
import { 
  Home, 
  BarChart3, 
  Users2, 
  MapPin, 
  FileText, 
  Building2, 
  UserCheck,
  PenTool,
  Settings,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  backUrl?: string;
}

const navigation = [
  { 
    name: "Dashboard", 
    href: "/admin-panel", 
    icon: Home,
    description: "Overview & Analytics"
  },
  { 
    name: "Properties", 
    href: "/admin-panel/properties", 
    icon: Building2,
    description: "Manage Property Listings"
  },
  { 
    name: "Analytics", 
    href: "/admin-panel/analytics", 
    icon: BarChart3,
    description: "Data & Insights"
  },
  { 
    name: "Leads", 
    href: "/admin-panel/leads", 
    icon: UserCheck,
    description: "Customer Management"
  },
  { 
    name: "Blog", 
    href: "/admin-panel/blog", 
    icon: PenTool,
    description: "Content Management"
  },
  { 
    name: "CIVIL+MEP Reports", 
    href: "/admin-panel/civil-mep-reports", 
    icon: FileText,
    description: "Engineering Reports"
  },
  { 
    name: "Developers", 
    href: "/admin-panel/developers", 
    icon: Users2,
    description: "Developer Directory"
  },
  { 
    name: "Zones", 
    href: "/admin-panel/zones", 
    icon: MapPin,
    description: "Location Management"
  },
];

export function AdminLayout({ children, title, showBackButton = false, backUrl = "/admin-panel" }: AdminLayoutProps) {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/admin-panel") {
      return location === href;
    }
    return location.startsWith(href);
  };

  const getCurrentPageName = () => {
    const currentNav = navigation.find(nav => isActive(nav.href));
    return currentNav?.name || "Admin Panel";
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
                <span className="text-lg font-bold text-gray-900">PropertyHub</span>
                <span className="text-xs text-gray-500 -mt-1">Admin Panel</span>
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

          {/* Customer Site Link */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                View Site
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 shadow-sm">
          <div className="h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Navigation */}
            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
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