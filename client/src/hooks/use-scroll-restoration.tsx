import { useEffect } from 'react';
import { useLocation } from 'wouter';

// Store scroll positions for different routes
const scrollPositions = new Map<string, number>();

// Hook to restore scroll position when navigating back to a page
export function useScrollRestoration() {
  const [location] = useLocation();

  useEffect(() => {
    // Restore scroll position for the current route
    const savedPosition = scrollPositions.get(location);
    if (savedPosition !== undefined) {
      // Use requestAnimationFrame to ensure DOM is rendered
      requestAnimationFrame(() => {
        window.scrollTo(0, savedPosition);
      });
    } else {
      // Scroll to top for new routes
      window.scrollTo(0, 0);
    }

    // Save scroll position when leaving the page
    const handleBeforeUnload = () => {
      scrollPositions.set(location, window.scrollY);
    };

    // Save scroll position when route changes
    const handleScroll = () => {
      scrollPositions.set(location, window.scrollY);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      // Save current scroll position before cleanup
      scrollPositions.set(location, window.scrollY);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location]);
}

// Component to handle scroll restoration globally
export function ScrollRestoration() {
  useScrollRestoration();
  return null;
}