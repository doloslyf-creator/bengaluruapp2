// Google Maps API type declarations

declare namespace google {
  namespace maps {
    enum GeocoderStatus {
      OK = 'OK',
      ZERO_RESULTS = 'ZERO_RESULTS',
      OVER_QUERY_LIMIT = 'OVER_QUERY_LIMIT',
      REQUEST_DENIED = 'REQUEST_DENIED',
      INVALID_REQUEST = 'INVALID_REQUEST',
      UNKNOWN_ERROR = 'UNKNOWN_ERROR'
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface MapOptions {
      center?: LatLngLiteral;
      zoom?: number;
      mapTypeId?: string;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
    }

    interface MarkerOptions {
      position?: LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: string;
      draggable?: boolean;
    }

    interface InfoWindowOptions {
      content?: string | HTMLElement;
      position?: LatLngLiteral;
      maxWidth?: number;
    }

    interface GeocoderRequest {
      address?: string;
      location?: LatLngLiteral;
      placeId?: string;
      componentRestrictions?: {
        country?: string;
      };
    }

    interface GeocoderResult {
      formatted_address: string;
      geometry: {
        location: LatLng;
        location_type: string;
        viewport: any;
      };
      place_id: string;
      types: string[];
      address_components: Array<{
        long_name: string;
        short_name: string;
        types: string[];
      }>;
    }

    class Map {
      constructor(mapDiv: HTMLElement, opts?: MapOptions);
      setCenter(latlng: LatLngLiteral): void;
      setZoom(zoom: number): void;
      getCenter(): LatLng;
      getZoom(): number;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latlng: LatLngLiteral): void;
      setMap(map: Map | null): void;
      getPosition(): LatLng;
      setTitle(title: string): void;
      setDraggable(draggable: boolean): void;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      open(map?: Map, anchor?: Marker): void;
      close(): void;
      setContent(content: string | HTMLElement): void;
      setPosition(position: LatLngLiteral): void;
    }

    class Geocoder {
      geocode(
        request: GeocoderRequest,
        callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
      ): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
    }

    namespace geometry {
      namespace spherical {
        function computeDistanceBetween(from: LatLng, to: LatLng): number;
      }
    }

    namespace places {
      interface AutocompleteOptions {
        componentRestrictions?: {
          country?: string | string[];
        };
        fields?: string[];
        types?: string[];
        bounds?: any;
        strictBounds?: boolean;
      }

      class Autocomplete {
        constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
        getPlace(): PlaceResult;
        addListener(eventName: string, handler: () => void): void;
      }

      interface PlaceResult {
        place_id?: string;
        formatted_address?: string;
        geometry?: {
          location: LatLng;
          viewport?: any;
        };
        name?: string;
        types?: string[];
        address_components?: Array<{
          long_name: string;
          short_name: string;
          types: string[];
        }>;
      }
    }
  }
}

declare global {
  interface Window {
    google?: typeof google;
    initMap?: () => void;
  }
}

export {};