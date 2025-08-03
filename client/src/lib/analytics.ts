// Google Analytics types
interface GtagEvent {
  event_category?: string;
  event_label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    GA_MEASUREMENT_ID?: string;
  }
}

// Initialize Google Analytics with measurement ID
export const initGA = (measurementId?: string) => {
  // Use provided measurementId or fall back to environment variable
  const gaId = measurementId || import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!gaId) {
    console.warn('Google Analytics measurement ID not provided');
    return;
  }

  console.log('Initializing Google Analytics with ID:', gaId);
  
  // Check if already initialized to avoid duplicates
  if (document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) {
    console.log('Google Analytics already initialized');
    return;
  }

  // Add Google Analytics script to the head
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${gaId}');
  `;
  document.head.appendChild(script2);

  // Store the measurement ID globally for other functions
  window.GA_MEASUREMENT_ID = gaId;
  
  // Test that Google Analytics is working by sending a test event
  setTimeout(() => {
    if (window.gtag) {
      console.log('Google Analytics is ready - gtag function available');
      // Send a test event to verify tracking is working
      window.gtag('event', 'page_view', {
        page_title: 'OwnItRight Analytics Test',
        page_location: window.location.href,
      });
    } else {
      console.warn('Google Analytics gtag function not available');
    }
  }, 1000);
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = window.GA_MEASUREMENT_ID || import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });
};

// Track events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number,
  customParameters?: Record<string, any>
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...customParameters,
  });
};

// Track specific business events
export const trackPropertyView = (propertyId: string, propertyType: string) => {
  trackEvent('view_property', 'property', propertyId, undefined, {
    property_type: propertyType,
  });
};

export const trackServiceRequest = (serviceType: string, amount?: number) => {
  trackEvent('request_service', 'services', serviceType, amount, {
    service_type: serviceType,
  });
};

export const trackLeadGeneration = (source: string, leadType: string) => {
  trackEvent('generate_lead', 'leads', source, undefined, {
    lead_type: leadType,
    lead_source: source,
  });
};

export const trackPropertySearch = (searchQuery: string, filters: Record<string, any>) => {
  trackEvent('search', 'property_search', searchQuery, undefined, {
    search_query: searchQuery,
    filters: JSON.stringify(filters),
  });
};

export const trackContactForm = (formType: string) => {
  trackEvent('submit_form', 'contact', formType, undefined, {
    form_type: formType,
  });
};

export const trackPaymentInitiated = (amount: number, serviceType: string) => {
  trackEvent('begin_checkout', 'payment', serviceType, amount, {
    currency: 'INR',
    service_type: serviceType,
  });
};

export const trackPaymentCompleted = (amount: number, serviceType: string, paymentId: string) => {
  trackEvent('purchase', 'payment', serviceType, amount, {
    currency: 'INR',
    transaction_id: paymentId,
    service_type: serviceType,
  });
};