import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/ui/logo";
import { useQuery } from "@tanstack/react-query";
import { type Property } from "@shared/schema";
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
  BookOpen
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Header() {
  const [location, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { user } = useAuth();

  // Fetch properties for search functionality
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Check if user has admin privileges
  const isAdmin = user ? (
    user.user_metadata?.role === 'admin' || 
    user.email?.endsWith('@ownitwise.com') ||
    user.email === 'admin@ownitwise.com'
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
    { name: "Find Properties", href: "/find-property", icon: Building2 },
    { name: "Learn", href: "/property-education", icon: BookOpen },
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

  // Filter properties based on search value
  const filteredProperties = properties.filter((property: Property) => {
    if (!searchValue.trim()) return false;
    const searchLower = searchValue.toLowerCase();
    return (
      property.name?.toLowerCase().includes(searchLower) ||
      property.developer?.toLowerCase().includes(searchLower) ||
      property.area?.toLowerCase().includes(searchLower) ||
      property.address?.toLowerCase().includes(searchLower)
    );
  }).slice(0, 8); // Limit to 8 results

  const handlePropertySelect = (propertyId: string, propertyName: string) => {
    setSearchValue("");
    setSearchOpen(false);
    navigate(`/property/${propertyId}/${propertyName.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const handleSearchSubmit = () => {
    if (searchValue.trim()) {
      setSearchOpen(false);
      navigate(`/find-property?search=${encodeURIComponent(searchValue)}`);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search suggestions
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        // Mock suggestions - replace with actual API call
        const suggestions = [
          'Whitefield Properties',
          'Sarjapur Road Apartments',
          'Electronic City Villas',
          'HSR Layout 2BHK',
          'Koramangala 3BHK'
        ].filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
        setSearchSuggestions(suggestions.slice(0, 5));
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearch = (query?: string) => {
    const searchTerm = query || searchQuery;
    if (searchTerm.trim()) {
      navigate(`/find-property?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      setSearchSuggestions([]);
    }
  };

  return (
    <div className="relative">
      {/* Minimalist Header */}
      <header className="fixed top-0 z-50 w-full bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Minimal Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="group">
                <h3 className="text-lg font-light text-gray-900">
                  Ownit<span className="text-emerald-600">Wise</span>
                </h3>
              </Link>
            </div>

            {/* Minimal Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
              {navigation.map((item) => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className={`text-sm transition-colors ${
                    isActive(item.href) 
                      ? "text-emerald-600" 
                      : "text-gray-600 hover:text-emerald-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Minimal Search */}
            <div className="hidden lg:flex items-center">
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-emerald-600 transition-colors">
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <Command>
                      <CommandInput
                        placeholder="Search by property name, developer, area..."
                        value={searchValue}
                        onValueChange={setSearchValue}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && filteredProperties.length === 0) {
                            handleSearchSubmit();
                          }
                        }}
                      />
                      <CommandList>
                        {searchValue.trim() && (
                          <>
                            {filteredProperties.length === 0 ? (
                              <CommandEmpty>
                                <div className="py-6 text-center">
                                  <p className="text-sm text-gray-600 mb-3">No properties found</p>
                                  <Button
                                    size="sm"
                                    onClick={handleSearchSubmit}
                                    className="bg-primary hover:bg-primary/90"
                                  >
                                    Search all properties
                                  </Button>
                                </div>
                              </CommandEmpty>
                            ) : (
                              <CommandGroup heading="Properties">
                                {filteredProperties.map((property: Property) => (
                                  <CommandItem
                                    key={property.id}
                                    value={property.name}
                                    onSelect={() => handlePropertySelect(property.id, property.name)}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center space-x-3 w-full">
                                      <Building2 className="h-4 w-4 text-gray-400" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {property.name}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                          {property.developer} • {property.area}
                                        </p>
                                      </div>
                                      <Badge variant="secondary" className="text-xs">
                                        {property.type}
                                      </Badge>
                                    </div>
                                  </CommandItem>
                                ))}
                                {filteredProperties.length > 0 && (
                                  <CommandItem onSelect={handleSearchSubmit} className="cursor-pointer border-t">
                                    <div className="flex items-center space-x-2 w-full justify-center py-2">
                                      <Search className="h-4 w-4" />
                                      <span className="text-sm font-medium">View all search results</span>
                                    </div>
                                  </CommandItem>
                                )}
                              </CommandGroup>
                            )}
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
            </div>

            {/* Minimal Right Side */}
            <div className="flex items-center space-x-6">
              {/* Account */}
              <Link 
                href="/my-account"
                className="hidden md:flex text-sm text-gray-600 hover:text-emerald-600 transition-colors"
              >
                Account
              </Link>

              {/* Admin for admins */}
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="hidden md:flex items-center space-x-1 text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                      <span>Admin</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border border-gray-100 shadow-lg rounded-xl">
                    {adminLinks.map((link) => (
                      <DropdownMenuItem key={link.name} asChild>
                        <Link href={link.href} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-emerald-600 hover:bg-gray-50">
                          <link.icon className="h-4 w-4 mr-3" />
                          {link.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin-panel/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-emerald-600 hover:bg-gray-50">
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Minimal Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <button className="lg:hidden p-2 text-gray-600 hover:text-emerald-600 transition-colors">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] sm:w-[400px] p-0 bg-white">
                  <div className="flex flex-col h-full">
                    {/* Minimal Mobile Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                      <Link href="/" className="group" onClick={() => setIsOpen(false)}>
                        <h3 className="text-lg font-light text-gray-900">
                          Ownit<span className="text-emerald-600">Wise</span>
                        </h3>
                      </Link>
                      <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Minimal Mobile Search */}
                    <div className="px-6 py-4 border-b border-gray-100">
                      <div className="relative">
                        <input
                          placeholder="Search properties..."
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSearchSubmit();
                              setIsOpen(false);
                            }
                          }}
                          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                        />
                        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      </div>
                      {searchValue.trim() && filteredProperties.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {filteredProperties.slice(0, 3).map((property: Property) => (
                            <button
                              key={property.id}
                              onClick={() => {
                                handlePropertySelect(property.id, property.name);
                                setIsOpen(false);
                              }}
                              className="w-full text-left p-3 rounded-xl bg-white border border-gray-100 hover:border-emerald-200 transition-colors"
                            >
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {property.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {property.developer} • {property.area}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Minimal Mobile Navigation */}
                    <div className="flex-1 px-6 py-6">
                      <nav className="space-y-1">
                        {navigation.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`block py-3 text-base transition-colors ${
                              isActive(item.href)
                                ? "text-emerald-600"
                                : "text-gray-600 hover:text-emerald-600"
                            }`}
                            onClick={() => setIsOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </nav>
                    </div>

                    {/* Minimal Mobile Footer */}
                    <div className="border-t border-gray-100 p-6">
                      <div className="space-y-3">
                        <Link
                          href="/my-account"
                          className="block py-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          My Account
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin-panel"
                            className="block py-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            Admin Panel
                          </Link>
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
      <div className="h-16"></div>
    </div>
  );
}