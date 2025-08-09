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
  Calendar,
  Sparkles,
  ArrowRight
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
      {/* Modern Animated Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md border-b shadow-lg' 
          : 'bg-white/80 backdrop-blur-sm border-b border-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section - Enhanced with Animation */}
            <Link href="/" className="group flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                  <Building2 className="h-6 w-6 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                {scrolled && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent group-hover:from-indigo-600 group-hover:to-blue-700 transition-all duration-300">
                  OwnItRight
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Property Advisory</p>
              </div>
            </Link>

            {/* Desktop Navigation - Enhanced with Animations */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <item.icon className={`h-4 w-4 transition-all duration-300 ${
                    isActive(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
                  }`} />
                  <span className="relative">
                    {item.name}
                    {isActive(item.href) && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
                    )}
                  </span>
                </Link>
              ))}

              {/* Services Dropdown - Enhanced */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300">
                    <Sparkles className="h-4 w-4" />
                    <span>Services</span>
                    <ChevronDown className="h-3 w-3 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2 bg-white/95 backdrop-blur-md border shadow-xl">
                  <div className="space-y-1">
                    <DropdownMenuItem asChild>
                      <Link href="/site-visit" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 transition-all duration-200">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Site Visits</div>
                          <div className="text-xs text-gray-500">Expert property tours</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/consultation" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50 transition-all duration-200">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Consultations</div>
                          <div className="text-xs text-gray-500">Property advisory</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/property-reports" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-purple-50 transition-all duration-200">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Reports</div>
                          <div className="text-xs text-gray-500">Professional analysis</div>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>

            {/* User Actions - Enhanced */}
            <div className="flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-blue-50 transition-all duration-300">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <ChevronDown className="h-3 w-3 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 p-2 bg-white/95 backdrop-blur-md border shadow-xl">
                      <div className="px-3 py-2 border-b">
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        {isAdmin && (
                          <Badge className="mt-1 bg-blue-100 text-blue-800 text-xs">Admin</Badge>
                        )}
                      </div>
                      
                      {isAdmin && (
                        <div className="py-2 border-b">
                          <div className="text-xs font-medium text-gray-500 mb-2 px-3">ADMIN PANEL</div>
                          {adminLinks.slice(0, 3).map((link) => (
                            <DropdownMenuItem key={link.name} asChild>
                              <Link href={link.href} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50">
                                <link.icon className="h-4 w-4 text-blue-600" />
                                <span className="text-sm">{link.name}</span>
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      )}
                      
                      <div className="pt-2">
                        <DropdownMenuItem className="p-2 text-red-600 hover:bg-red-50">
                          Sign Out
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <div className="hidden lg:flex items-center space-x-3">
                  <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-300">
                    Contact
                  </Link>
                  <Link href="/user-dashboard">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                      <span>Get Started</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle - Enhanced */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden p-2 rounded-xl hover:bg-blue-50 transition-all duration-300">
                    <Menu className="h-5 w-5 text-gray-600" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-80 p-0 bg-white/95 backdrop-blur-md">
                  <div className="flex flex-col h-full">
                    {/* Mobile Header */}
                    <div className="flex items-center justify-between p-6 border-b">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h2 className="font-bold text-lg">OwnItRight</h2>
                          <p className="text-xs text-gray-500">Property Advisory</p>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="flex-1 py-6">
                      <nav className="px-6 space-y-2">
                        {navigation.map((item, index) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-3 p-4 rounded-xl transition-all duration-300 ${
                              isActive(item.href)
                                ? 'bg-blue-100 text-blue-700 shadow-sm transform scale-105'
                                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.name}</span>
                          </Link>
                        ))}
                      </nav>

                      {/* Mobile Services Section */}
                      <div className="px-6 mt-8">
                        <h3 className="text-sm font-semibold text-gray-500 mb-4">SERVICES</h3>
                        <div className="space-y-2">
                          <Link href="/site-visit" onClick={() => setIsOpen(false)} 
                                className="flex items-center space-x-3 p-4 rounded-xl hover:bg-blue-50 transition-all duration-300">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">Site Visits</span>
                          </Link>
                          <Link href="/consultation" onClick={() => setIsOpen(false)}
                                className="flex items-center space-x-3 p-4 rounded-xl hover:bg-green-50 transition-all duration-300">
                            <MessageCircle className="h-5 w-5 text-green-600" />
                            <span className="font-medium">Consultations</span>
                          </Link>
                          <Link href="/property-reports" onClick={() => setIsOpen(false)}
                                className="flex items-center space-x-3 p-4 rounded-xl hover:bg-purple-50 transition-all duration-300">
                            <FileText className="h-5 w-5 text-purple-600" />
                            <span className="font-medium">Property Reports</span>
                          </Link>
                        </div>
                      </div>

                      {/* Mobile User Actions */}
                      {!user && (
                        <div className="px-6 mt-8 space-y-3">
                          <Link href="/contact" onClick={() => setIsOpen(false)}>
                            <Button variant="outline" className="w-full justify-center rounded-xl">
                              Contact Us
                            </Button>
                          </Link>
                          <Link href="/user-dashboard" onClick={() => setIsOpen(false)}>
                            <Button className="w-full justify-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl">
                              Get Started
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16"></div>
    </div>
  );
}