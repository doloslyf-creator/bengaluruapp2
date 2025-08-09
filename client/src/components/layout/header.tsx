import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  Search, 
  FileText, 
  Phone, 
  Menu,
  Building2,
  ChevronDown,
  Settings,
  User,
  X,
  MapPin,
  TrendingUp,
  UserCircle,
  MessageCircle,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  // Check if user has admin privileges
  const isAdmin = user ? (
    user.user_metadata?.role === 'admin' || 
    user.email?.endsWith('@ownitright.com') ||
    user.email === 'admin@ownitright.com'
  ) : false;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Find Property", href: "/find-property", icon: Search },
    { name: "Property Archive", href: "/property-archive", icon: Building2 },
    { name: "About Us", href: "/about", icon: UserCircle },
  ];

  const adminLinks = [
    { name: "Dashboard", href: "/admin-panel", icon: TrendingUp },
    { name: "Properties", href: "/admin-panel/properties", icon: Building2 },
    { name: "Leads Management", href: "/admin-panel/leads", icon: UserCircle },
    { name: "CIVIL+MEP Reports", href: "/admin-panel/civil-mep-reports", icon: FileText },
    { name: "Orders & Revenue", href: "/admin-panel/orders", icon: TrendingUp },

  ];

  const isActive = (href: string) => {
    if (href === "/") return location === href;
    return location.startsWith(href);
  };

  return (
    <div className="relative">
      {/* Header with proper spacing for promotional banners */}
      <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "bg-white/98 backdrop-blur-lg border-b border-gray-200 shadow-lg" 
          : "bg-white/90 backdrop-blur-sm border-b border-gray-100"
      }`}>


        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 lg:h-18 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <Building2 className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-200" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
                <div className="hidden sm:flex flex-col">
                  <div className="text-xl font-black tracking-tight text-gray-900">
                    Own<span className="text-orange-500">It</span><span className="text-blue-600">Right</span>
                  </div>
                  <span className="text-xs text-gray-500 -mt-1 font-medium">Expert Property Advisors</span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Button 
                  key={item.name}
                  asChild 
                  variant="ghost" 
                  className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary hover:bg-primary/5 ${
                    isActive(item.href) ? "text-primary bg-primary/10" : "text-gray-700"
                  }`}
                >
                  <Link href={item.href}>{item.name}</Link>
                </Button>
              ))}
            </nav>

            {/* Right side buttons */}
            <div className="flex items-center space-x-3">
              {/* Customer Account */}
              <Button asChild variant="ghost" size="sm" className="hidden md:flex">
                <Link href="/my-account">
                  <User className="h-4 w-4 mr-2" />
                  My Account
                </Link>
              </Button>


              {/* Admin Panel for admins */}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hidden md:flex">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {adminLinks.map((link) => (
                      <DropdownMenuItem key={link.name} asChild>
                        <Link href={link.href} className="flex items-center">
                          <link.icon className="h-4 w-4 mr-3" />
                          {link.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin-panel/settings" className="flex items-center">
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* CTA Button */}
              <Button asChild className="hidden md:flex bg-primary hover:bg-primary/90 text-white px-6">
                <Link href="/find-property">
                  <Search className="h-4 w-4 mr-2" />
                  Find Property
                </Link>
              </Button>

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] sm:w-[400px] p-0">
                  <div className="flex flex-col h-full">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                      <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                        <Building2 className="h-6 w-6 text-primary" />
                        <div className="flex flex-col">
                          <div className="text-lg font-black tracking-tight text-gray-900">
                            Own<span className="text-orange-500">It</span><span className="text-blue-600">Right</span>
                          </div>
                          <span className="text-xs text-gray-500 -mt-1">Expert Properties</span>
                        </div>
                      </Link>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex-1 px-6 py-4 space-y-1">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center space-x-3 px-3 py-3 text-base font-medium rounded-lg transition-colors ${
                            isActive(item.href)
                              ? "text-primary bg-primary/10"
                              : "text-gray-700 hover:text-primary hover:bg-gray-50"
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>

                    {/* Mobile Footer Actions */}
                    <div className="border-t p-6 space-y-3">
                      <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                        <Link href="/find-property">
                          <Search className="h-4 w-4 mr-2" />
                          Find Property
                        </Link>
                      </Button>
                      <div className={`grid gap-3 ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        <Button asChild variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                          <Link href="/my-account">
                            <User className="h-4 w-4 mr-2" />
                            My Account
                          </Link>
                        </Button>
                        {isAdmin && (
                          <Button asChild variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                            <Link href="/admin-panel">
                              <Settings className="h-4 w-4 mr-2" />
                              Admin Panel
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Content spacer to prevent overlap */}
      <div className={`transition-all duration-300 ${scrolled ? 'h-16' : 'h-28'}`}></div>
    </div>
  );
}