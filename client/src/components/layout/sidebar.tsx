import { useLocation } from "wouter";
import { Link } from "wouter";
import { Home, BarChart3, Users, MapPin, FileText } from "lucide-react";

const navigation = [
  { name: "Properties", href: "/", icon: Home },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Developers", href: "/developers", icon: Users },
  { name: "Zones", href: "/zones", icon: MapPin },
  { name: "CIVIL+MEP Reports", href: "/civil-mep-reports", icon: FileText },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">PropertyPro</h1>
        <p className="text-sm text-gray-600 mt-1">Bengaluru Real Estate</p>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 ${
                  isActive ? "text-primary" : "text-gray-400"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-900">Admin Panel</p>
          <p className="text-xs text-gray-600 mt-1">
            Manage Bengaluru residential properties with comprehensive insights
          </p>
        </div>
      </div>
    </div>
  );
}