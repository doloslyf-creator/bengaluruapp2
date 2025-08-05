import { useEffect } from 'react';

interface HeadTagsProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: string;
}

export default function HeadTags({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  canonicalUrl,
  structuredData 
}: HeadTagsProps) {
  useEffect(() => {
    // Update title
    document.title = title;
    
    // Basic meta tags
    updateMetaTag('description', description);
    if (keywords) updateMetaTag('keywords', keywords);
    updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMetaTag('googlebot', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    
    // Open Graph tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', 'website', 'property');
    updateMetaTag('og:url', canonicalUrl || window.location.href, 'property');
    updateMetaTag('og:site_name', 'OwnItRight - Property Advisory Services', 'property');
    updateMetaTag('og:locale', 'en_US', 'property');
    
    if (ogImage) {
      updateMetaTag('og:image', ogImage, 'property');
      updateMetaTag('og:image:width', '1200', 'property');
      updateMetaTag('og:image:height', '630', 'property');
      updateMetaTag('og:image:alt', title, 'property');
    }
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:title', title, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:site', '@ownitright', 'name');
    updateMetaTag('twitter:creator', '@ownitright', 'name');
    
    if (ogImage) {
      updateMetaTag('twitter:image', ogImage, 'name');
      updateMetaTag('twitter:image:alt', title, 'name');
    }
    
    // Mobile optimization
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, viewport-fit=cover', 'name');
    updateMetaTag('theme-color', '#2563eb', 'name');
    updateMetaTag('msapplication-TileColor', '#2563eb', 'name');
    updateMetaTag('apple-mobile-web-app-capable', 'yes', 'name');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'default', 'name');
    updateMetaTag('apple-mobile-web-app-title', 'OwnItRight', 'name');
    
    // Canonical URL
    if (canonicalUrl) {
      updateLinkTag('canonical', canonicalUrl);
    }
    
    // Preconnect to important domains
    updateLinkTag('preconnect', 'https://fonts.googleapis.com');
    updateLinkTag('preconnect', 'https://fonts.gstatic.com', true);
    updateLinkTag('preconnect', 'https://www.google-analytics.com');
    
    // DNS prefetch for performance
    updateLinkTag('dns-prefetch', 'https://checkout.razorpay.com');
    updateLinkTag('dns-prefetch', 'https://api.razorpay.com');
    
    // Manifest
    updateLinkTag('manifest', '/manifest.json');
    
    // Structured data
    if (structuredData) {
      injectStructuredData(structuredData, 'structured-data');
    }
    
  }, [title, description, keywords, ogImage, canonicalUrl, structuredData]);

  return null;
}

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

const updateLinkTag = (rel: string, href: string, crossOrigin?: boolean) => {
  let element = document.querySelector(`link[rel="${rel}"][href="${href}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    element.href = href;
    if (crossOrigin) {
      element.crossOrigin = 'anonymous';
    }
    document.head.appendChild(element);
  }
};

const injectStructuredData = (data: string, id: string) => {
  // Remove existing structured data with same ID
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }
  
  // Create and inject new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = id;
  script.textContent = data;
  document.head.appendChild(script);
};