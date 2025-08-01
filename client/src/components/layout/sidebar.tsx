import { Building, BarChart3, Users, MapPin, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Properties", icon: Building, href: "/", current: true },
  { name: "Analytics", icon: BarChart3, href: "/analytics", current: false },
  { name: "Developers", icon: Users, href: "/developers", current: false },
  { name: "Zones", icon: MapPin, href: "/zones", current: false },
  { name: "Settings", icon: Settings, href: "/settings", current: false },
];

export function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-border flex-shrink-0">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Building className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900">PropAdmin</h1>
        </div>
      </div>
      
      <nav className="px-4 pb-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                item.current
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-50",
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors"
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
