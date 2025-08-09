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
  Calendar
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
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <div className="hidden sm:block">
                  <Logo size="sm" showTagline={false} />
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

              {/* Search Component */}
              <div className="ml-4">
                <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={searchOpen}
                      className="w-64 justify-start text-gray-500"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      Search properties...
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
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
                        <Logo size="sm" showTagline={false} />
                      </Link>
                    </div>

                    {/* Mobile Search */}
                    <div className="px-6 py-4 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Search properties..."
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSearchSubmit();
                              setIsOpen(false);
                            }
                          }}
                          className="pl-10"
                        />
                      </div>
                      {searchValue.trim() && filteredProperties.length > 0 && (
                        <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                          {filteredProperties.slice(0, 4).map((property: Property) => (
                            <button
                              key={property.id}
                              onClick={() => {
                                handlePropertySelect(property.id, property.name);
                                setIsOpen(false);
                              }}
                              className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                <Building2 className="h-4 w-4 text-gray-400" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {property.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {property.developer} • {property.area}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
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