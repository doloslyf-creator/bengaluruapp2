
import { useState } from 'react';
import { Menu, X, Home, Search, MapPin, Phone, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useLocation } from 'wouter';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Search, label: 'Find Property', href: '/find-property' },
  { icon: MapPin, label: 'About', href: '/about' },
  { icon: Phone, label: 'Contact', href: '/contact' },
  { icon: User, label: 'Account', href: '/my-account' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  const handleNavigation = (href: string) => {
    navigate(href);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <div className="flex flex-col space-y-4 mt-4">
          {navItems.map(({ icon: Icon, label, href }) => (
            <Button
              key={href}
              variant="ghost"
              className="justify-start text-left h-12"
              onClick={() => handleNavigation(href)}
            >
              <Icon className="mr-3 h-5 w-5" />
              {label}
            </Button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
