// Navigation utility with scroll restoration
export function navigateWithScrollReset(navigate: (path: string) => void, path: string) {
  navigate(path);
  // Small delay to ensure navigation happens before scroll
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 0);
}

// Custom hook for navigation with scroll reset
export function useNavigateWithScroll() {
  return (navigate: (path: string) => void) => {
    return (path: string) => navigateWithScrollReset(navigate, path);
  };
}