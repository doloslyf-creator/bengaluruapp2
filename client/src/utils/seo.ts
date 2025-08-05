// SEO utility functions
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export const generatePropertySlug = (property: { name: string; area?: string; developer?: string }): string => {
  const parts = [property.name];
  if (property.area) parts.push(property.area);
  if (property.developer) parts.push(property.developer);
  
  return parts
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const updateMetaTags = (
  title: string,
  description: string,
  keywords?: string,
  ogImage?: string,
  canonicalUrl?: string
) => {
  // Update title
  document.title = title;
  
  // Update meta description
  updateMetaTag('description', description);
  
  // Update keywords if provided
  if (keywords) {
    updateMetaTag('keywords', keywords);
  }
  
  // Update Open Graph tags
  updateMetaTag('og:title', title, 'property');
  updateMetaTag('og:description', description, 'property');
  updateMetaTag('og:type', 'website', 'property');
  updateMetaTag('og:site_name', 'OwnItRight - Property Advisory Services', 'property');
  
  if (ogImage) {
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('twitter:image', ogImage, 'name');
  }
  
  // Update Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image', 'name');
  updateMetaTag('twitter:title', title, 'name');
  updateMetaTag('twitter:description', description, 'name');
  
  // Update canonical URL
  if (canonicalUrl) {
    updateLinkTag('canonical', canonicalUrl);
  }
};

const updateMetaTag = (name: string, content: string, type: 'name' | 'property' = 'name') => {
  const attribute = type === 'property' ? 'property' : 'name';
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.content = content;
};

const updateLinkTag = (rel: string, href: string) => {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  
  element.href = href;
};

// Schema markup generators
export const generatePropertySchema = (property: any) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstateProperty",
    "name": property.name,
    "description": `${property.name} in ${property.area} - Premium property with excellent connectivity and amenities`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.area,
      "addressRegion": "Karnataka",
      "addressCountry": "IN"
    },
    "offers": property.configurations?.map((config: any) => ({
      "@type": "Offer",
      "price": config.price,
      "priceCurrency": "INR",
      "availability": config.availabilityStatus === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    })),
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Parking" },
      { "@type": "LocationFeatureSpecification", "name": "Security" },
      { "@type": "LocationFeatureSpecification", "name": "Elevator" }
    ],
    "floorSize": {
      "@type": "QuantitativeValue",
      "value": property.configurations?.[0]?.builtUpArea || 0,
      "unitCode": "SQF"
    },
    "numberOfRooms": property.configurations?.[0]?.configuration.match(/\d+/)?.[0] || "2",
    "propertyType": property.type,
    "url": `${window.location.origin}/property/${property.id}/${generatePropertySlug(property)}`
  };
  
  return JSON.stringify(schema);
};

export const generateBreadcrumbSchema = (items: Array<{name: string, url: string}>) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
  
  return JSON.stringify(schema);
};

export const generateLocalBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "OwnItRight Property Advisory",
    "image": `${window.location.origin}/logo.png`,
    "description": "Professional property advisory services in Bangalore specializing in property valuations, CIVIL+MEP reports, and legal due diligence.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bangalore",
      "addressRegion": "Karnataka",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "12.9716",
      "longitude": "77.5946"
    },
    "url": window.location.origin,
    "telephone": "+91-9876543210",
    "email": "info@ownitright.com",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "15:00"
      }
    ],
    "priceRange": "₹999-₹2499",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "124"
    },
    "sameAs": [
      "https://facebook.com/ownitright",
      "https://twitter.com/ownitright",
      "https://linkedin.com/company/ownitright"
    ]
  };
  
  return JSON.stringify(schema);
};

export const generateOrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "RealEstate",
    "name": "OwnItRight",
    "description": "Property advisory services specializing in residential and commercial real estate in Bangalore",
    "url": window.location.origin,
    "logo": `${window.location.origin}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9876543210",
      "contactType": "Customer Service",
      "availableLanguage": ["English", "Hindi", "Kannada"]
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Bangalore",
      "addressRegion": "Karnataka",
      "addressCountry": "IN"
    },
    "sameAs": [
      "https://facebook.com/ownitright",
      "https://twitter.com/ownitright",
      "https://linkedin.com/company/ownitright"
    ]
  };
  
  return JSON.stringify(schema);
};

export const injectSchema = (schema: string, id: string) => {
  // Remove existing schema with same ID
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }
  
  // Create and inject new schema
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = schema;
  document.head.appendChild(script);
};