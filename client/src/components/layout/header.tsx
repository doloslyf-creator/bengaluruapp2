import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
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
  BookOpen,
  UserCircle
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Find Property", href: "/find-property", icon: Search },
    { name: "Services", href: "/services", icon: TrendingUp, hasDropdown: true },
    { name: "Insights", href: "/blog", icon: BookOpen },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  const services = [
    { name: "Property Valuation", href: "/property-valuation", description: "Professional property assessment" },
    { name: "CIVIL+MEP Reports", href: "/civil-mep-reports", description: "Engineering analysis reports" },
    { name: "Legal Due Diligence", href: "/services/legal", description: "Complete legal verification" },
    { name: "Site Visit Booking", href: "/book-visit", description: "Schedule property visits" },
  ];

  const adminLinks = [
    { name: "Dashboard", href: "/admin-panel", icon: TrendingUp },
    { name: "Properties", href: "/admin-panel/properties", icon: Building2 },
    { name: "Leads Management", href: "/admin-panel/leads", icon: UserCircle },
    { name: "CIVIL+MEP Reports", href: "/admin-panel/civil-mep-reports", icon: FileText },
    { name: "Orders & Revenue", href: "/admin-panel/orders", icon: TrendingUp },
    { name: "Blog Management", href: "/admin-panel/blog", icon: BookOpen },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === href;
    return location.startsWith(href);
  };

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${
      scrolled 
        ? "bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm" 
        : "bg-white/80 backdrop-blur-sm"
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
                <span className="text-xs text-gray-500 -mt-1 font-medium">Curated Property Advisors</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <div key={item.name} className="relative">
                {item.hasDropdown ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary hover:bg-primary/5 ${
                          isActive(item.href) ? "text-primary bg-primary/10" : "text-gray-700"
                        }`}
                      >
                        {item.name}
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      {services.map((service) => (
                        <DropdownMenuItem key={service.name} asChild>
                          <Link href={service.href} className="flex flex-col items-start">
                            <span className="font-medium">{service.name}</span>
                            <span className="text-sm text-gray-500">{service.description}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    href={item.href}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:text-primary hover:bg-primary/5 ${
                      isActive(item.href)
                        ? "text-primary bg-primary/10"
                        : "text-gray-700"
                    }`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* User Panel */}
            <Button asChild variant="ghost" size="sm" className="hidden md:flex text-gray-600 hover:text-primary">
              <Link href="/user-dashboard">
                <User className="h-4 w-4 mr-2" />
                My Panel
              </Link>
            </Button>

            {/* Admin Access */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden md:flex text-gray-600 hover:text-primary">
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
                        <span className="text-xs text-gray-500 -mt-1">Curated Properties</span>
                      </div>
                    </Link>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex-1 px-6 py-4 space-y-1">
                    {navigation.map((item) => (
                      <div key={item.name}>
                        <Link
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
                        
                        {item.hasDropdown && (
                          <div className="ml-8 mt-2 space-y-1">
                            {services.map((service) => (
                              <Link
                                key={service.name}
                                href={service.href}
                                className="block px-3 py-2 text-sm text-gray-600 hover:text-primary hover:bg-gray-50 rounded-md"
                                onClick={() => setIsOpen(false)}
                              >
                                {service.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
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
                    <div className="grid grid-cols-2 gap-3">
                      <Button asChild variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                        <Link href="/user-dashboard">
                          <User className="h-4 w-4 mr-2" />
                          My Panel
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                        <Link href="/admin-panel">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}