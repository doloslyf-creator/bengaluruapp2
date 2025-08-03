import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { trackPageView, initGA } from '../lib/analytics';

interface ApiKeysData {
  googleAnalyticsId?: string;
  googleMapsApiKey?: string;
  razorpayKeyId?: string;
  [key: string]: any;
}

// Hook to initialize Google Analytics with API keys from server
export const useAnalyticsInit = () => {
  const { data: apiKeys } = useQuery<ApiKeysData>({
    queryKey: ['/api/settings/api-keys'],
    retry: false,
  });

  useEffect(() => {
    if (apiKeys?.googleAnalyticsId) {
      console.log('Initializing Google Analytics with measurement ID:', apiKeys.googleAnalyticsId);
      initGA(apiKeys.googleAnalyticsId);
    }
  }, [apiKeys?.googleAnalyticsId]);
};

// Hook to track page views
export const useAnalytics = () => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  
  useEffect(() => {
    if (location !== prevLocationRef.current) {
      trackPageView(location);
      prevLocationRef.current = location;
    }
  }, [location]);
};