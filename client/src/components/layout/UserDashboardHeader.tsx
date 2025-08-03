import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useUserAuth } from "@/hooks/useUserAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Bell, LogOut, Menu } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";

// Dynamic user data from Supabase auth
const getUserDisplayData = (user: any) => ({
  id: user.id,
  name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
  email: user.email,
  phone: user.user_metadata?.phone || "",
  avatar: user.user_metadata?.avatar_url || "",
  memberSince: new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  location: user.user_metadata?.location || "",
  preferredBudget: user.user_metadata?.preferred_budget || "",
});

interface UserDashboardHeaderProps {
  currentPage?: string;
}

export function UserDashboardHeader({ currentPage }: UserDashboardHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useUserAuth();
  const [location] = useLocation();

  if (!user) return null;

  const userData = getUserDisplayData(user);

  const navigationItems = [
    { href: "/user-dashboard", label: "Dashboard", active: location === "/user-dashboard" },
    { href: "/find-property", label: "Properties", active: location.startsWith("/find-property") },
    { href: "/user-dashboard/valuation-reports", label: "Valuation", active: location.includes("/valuation") },
    { href: "/user-dashboard/civil-mep-reports", label: "Reports", active: location.includes("/civil-mep") },
    { href: "/user-dashboard/legal-tracker", label: "Legal", active: location.includes("/legal") },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/user-dashboard">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="text-2xl font-black tracking-tight text-gray-900">
                Own<span className="text-orange-500">It</span><span className="text-blue-600">Right</span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span className={`transition-colors ${
                  item.active 
                    ? "text-blue-600 font-medium" 
                    : "text-gray-700 hover:text-blue-600"
                }`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <NotificationBell userId={userData.email} className="text-gray-700 hover:text-blue-600" />
            
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userData.avatar} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {userData.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900">{userData.name}</p>
                <p className="text-xs text-gray-500">Member since {userData.memberSince}</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>

            {/* Mobile menu button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-6">
                  {navigationItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <span className={`block py-2 transition-colors ${
                        item.active 
                          ? "text-blue-600 font-medium" 
                          : "text-gray-700 hover:text-blue-600"
                      }`} onClick={() => setIsMobileMenuOpen(false)}>
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Breadcrumb or Page Title */}
      {currentPage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/user-dashboard" className="hover:text-blue-600">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{currentPage}</span>
          </div>
        </div>
      )}
    </header>
  );
}