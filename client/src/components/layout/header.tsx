import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Home, 
  Search, 
  FileText, 
  Phone, 
  Menu,
  Building2,
  ChevronDown,
  Settings
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Find Property", href: "/find-property", icon: Search },
    { name: "Insights", href: "/blog", icon: FileText },
    { name: "Contact", href: "/contact", icon: Phone },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === href;
    return location.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="mr-8">
          <Link href="/" className="flex items-center space-x-2">
            <Building2 className="h-7 w-7 text-primary" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">PropertyHub</span>
              <span className="text-xs text-gray-500 -mt-1">Bengaluru Real Estate</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`transition-colors hover:text-primary ${
                isActive(item.href)
                  ? "text-primary font-semibold"
                  : "text-gray-700"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="ml-auto flex items-center space-x-4">
          {/* Admin Access */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden md:flex">
                <Settings className="h-4 w-4 mr-2" />
                Admin
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/admin-panel">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin-panel/leads">Leads</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin-panel/blog">Blog Management</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin-panel/civil-mep-reports">CIVIL+MEP Reports</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* CTA Button */}
          <Button asChild className="hidden md:flex">
            <Link href="/find-property">Find Property</Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 text-lg transition-colors hover:text-primary ${
                      isActive(item.href)
                        ? "text-primary font-semibold"
                        : "text-gray-700"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                
                <div className="pt-4 border-t space-y-2">
                  <Button asChild className="w-full justify-start" onClick={() => setIsOpen(false)}>
                    <Link href="/find-property">Find Property</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start" onClick={() => setIsOpen(false)}>
                    <Link href="/admin-panel">Admin Panel</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}