import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";

interface SetupStatus {
  setupRequired: boolean;
  hasSupabaseUrl: boolean;
  hasSupabaseKey: boolean;
  hasDatabaseUrl: boolean;
  setupCompleted: boolean;
}

export function useSetupStatus() {
  const [, setLocation] = useLocation();
  
  const { data: setupStatus, isLoading } = useQuery<SetupStatus>({
    queryKey: ["/api/setup/status"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // Only redirect if we have setup status data and setup is required
    if (setupStatus && setupStatus.setupRequired && window.location.pathname !== '/setup') {
      setLocation('/setup');
    }
  }, [setupStatus, setLocation]);

  return {
    setupStatus,
    isLoading,
    setupRequired: setupStatus?.setupRequired || false,
  };
}