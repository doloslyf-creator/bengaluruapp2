// Google Maps integration utility

interface GoogleMapsConfig {
  apiKey: string;
  libraries?: string[];
}

interface PlaceResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  types: string[];
}

interface GeocodeResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
  types: string[];
}

class GoogleMapsService {
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private apiKey: string | null = null;

  async initialize(config: GoogleMapsConfig): Promise<void> {
    if (this.isLoaded) return;
    
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.apiKey = config.apiKey;
    
    this.loadPromise = new Promise((resolve, reject) => {
      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        this.isLoaded = true;
        resolve();
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      
      const libraries = config.libraries || ['places', 'geometry'];
      script.src = `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=${libraries.join(',')}&callback=initMap`;
      
      // Set up callback
      (window as any).initMap = () => {
        this.isLoaded = true;
        delete (window as any).initMap;
        resolve();
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  isReady(): boolean {
    return this.isLoaded && !!(window.google && window.google.maps);
  }

  async createMap(container: HTMLElement, options: google.maps.MapOptions): Promise<google.maps.Map> {
    if (!this.isReady()) {
      throw new Error('Google Maps not initialized');
    }

    return new google.maps.Map(container, {
      zoom: 12,
      center: { lat: 12.9716, lng: 77.5946 }, // Bengaluru center
      ...options,
    });
  }

  async createAutocomplete(
    input: HTMLInputElement,
    options?: google.maps.places.AutocompleteOptions
  ): Promise<google.maps.places.Autocomplete> {
    if (!this.isReady()) {
      throw new Error('Google Maps not initialized');
    }

    const defaultOptions: google.maps.places.AutocompleteOptions = {
      componentRestrictions: { country: 'in' },
      fields: ['place_id', 'formatted_address', 'geometry', 'name', 'types'],
      types: ['address'],
      ...options,
    };

    return new google.maps.places.Autocomplete(input, defaultOptions);
  }

  async geocodeAddress(address: string): Promise<GeocodeResult[]> {
    if (!this.isReady()) {
      throw new Error('Google Maps not initialized');
    }

    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
          const formattedResults: GeocodeResult[] = results.map(result => ({
            formatted_address: result.formatted_address,
            geometry: {
              location: {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng(),
              },
            },
            place_id: result.place_id,
            types: result.types,
          }));
          resolve(formattedResults);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult[]> {
    if (!this.isReady()) {
      throw new Error('Google Maps not initialized');
    }

    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results) {
          const formattedResults: GeocodeResult[] = results.map(result => ({
            formatted_address: result.formatted_address,
            geometry: {
              location: {
                lat: result.geometry.location.lat(),
                lng: result.geometry.location.lng(),
              },
            },
            place_id: result.place_id,
            types: result.types,
          }));
          resolve(formattedResults);
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  }

  async calculateDistance(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<number> {
    if (!this.isReady()) {
      throw new Error('Google Maps not initialized');
    }

    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(origin.lat, origin.lng),
      new google.maps.LatLng(destination.lat, destination.lng)
    );

    return distance; // Returns distance in meters
  }

  createMarker(map: google.maps.Map, options: google.maps.MarkerOptions): google.maps.Marker {
    if (!this.isReady()) {
      throw new Error('Google Maps not initialized');
    }

    return new google.maps.Marker({
      map,
      ...options,
    });
  }

  createInfoWindow(options: google.maps.InfoWindowOptions): google.maps.InfoWindow {
    if (!this.isReady()) {
      throw new Error('Google Maps not initialized');
    }

    return new google.maps.InfoWindow(options);
  }
}

// Export singleton instance
export const googleMapsService = new GoogleMapsService();

// Utility function to format distance
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  } else {
    return `${(meters / 1000).toFixed(1)} km`;
  }
}

// Utility function to get user's current location
export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes
      }
    );
  });
}

// Export types for use in components
export type { google };