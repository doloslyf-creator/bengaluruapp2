import { useState, useEffect, useCallback } from 'react';
import { googleMapsService } from '@/lib/maps';

interface UseMapsOptions {
  apiKey: string;
  libraries?: string[];
}

interface MapInstance {
  map: google.maps.Map | null;
  isLoaded: boolean;
  error: string | null;
}

export function useMaps({ apiKey, libraries = ['places', 'geometry'] }: UseMapsOptions) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key is required');
      return;
    }

    let mounted = true;

    const initializeMaps = async () => {
      try {
        await googleMapsService.initialize({ apiKey, libraries });
        if (mounted) {
          setIsLoaded(true);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
          setIsLoaded(false);
        }
      }
    };

    initializeMaps();

    return () => {
      mounted = false;
    };
  }, [apiKey, libraries]);

  const createMap = useCallback(
    (container: HTMLElement, options?: google.maps.MapOptions): google.maps.Map | null => {
      if (!isLoaded || !googleMapsService.isReady()) {
        return null;
      }
      
      try {
        return googleMapsService.createMap(container, options || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create map');
        return null;
      }
    },
    [isLoaded]
  );

  const createAutocomplete = useCallback(
    (input: HTMLInputElement, options?: google.maps.places.AutocompleteOptions): google.maps.places.Autocomplete | null => {
      if (!isLoaded || !googleMapsService.isReady()) {
        return null;
      }
      
      try {
        return googleMapsService.createAutocomplete(input, options);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create autocomplete');
        return null;
      }
    },
    [isLoaded]
  );

  const geocodeAddress = useCallback(
    async (address: string) => {
      if (!isLoaded || !googleMapsService.isReady()) {
        throw new Error('Google Maps not ready');
      }
      
      return googleMapsService.geocodeAddress(address);
    },
    [isLoaded]
  );

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (!isLoaded || !googleMapsService.isReady()) {
        throw new Error('Google Maps not ready');
      }
      
      return googleMapsService.reverseGeocode(lat, lng);
    },
    [isLoaded]
  );

  const calculateDistance = useCallback(
    async (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
      if (!isLoaded || !googleMapsService.isReady()) {
        throw new Error('Google Maps not ready');
      }
      
      return googleMapsService.calculateDistance(origin, destination);
    },
    [isLoaded]
  );

  return {
    isLoaded,
    error,
    createMap,
    createAutocomplete,
    geocodeAddress,
    reverseGeocode,
    calculateDistance,
    googleMapsService: isLoaded ? googleMapsService : null,
  };
}

export function useMapInstance(
  containerRef: React.RefObject<HTMLElement>,
  options?: google.maps.MapOptions,
  mapsConfig?: UseMapsOptions
): MapInstance {
  const [mapInstance, setMapInstance] = useState<MapInstance>({
    map: null,
    isLoaded: false,
    error: null,
  });

  const { isLoaded, error, createMap } = useMaps(mapsConfig || { apiKey: '' });

  useEffect(() => {
    if (!isLoaded || !containerRef.current || mapInstance.map) {
      return;
    }

    try {
      const map = createMap(containerRef.current, options);
      if (map) {
        setMapInstance({
          map,
          isLoaded: true,
          error: null,
        });
      }
    } catch (err) {
      setMapInstance({
        map: null,
        isLoaded: false,
        error: err instanceof Error ? err.message : 'Failed to create map',
      });
    }
  }, [isLoaded, containerRef, createMap, options, mapInstance.map]);

  useEffect(() => {
    if (error) {
      setMapInstance({
        map: null,
        isLoaded: false,
        error,
      });
    }
  }, [error]);

  return mapInstance;
}