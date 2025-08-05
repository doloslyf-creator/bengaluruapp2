import { useEffect } from 'react';

export default function MobileOptimization() {
  useEffect(() => {
    // Add mobile-specific meta tags
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, viewport-fit=cover';
      document.head.appendChild(meta);
    }

    // Touch icon for iOS
    const touchIcon = document.createElement('link');
    touchIcon.rel = 'apple-touch-icon';
    touchIcon.href = '/logo-192.png';
    document.head.appendChild(touchIcon);

    // Mobile theme color
    const themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    themeColor.content = '#2563eb';
    document.head.appendChild(themeColor);

    // Microsoft tile color
    const msColor = document.createElement('meta');
    msColor.name = 'msapplication-TileColor';
    msColor.content = '#2563eb';
    document.head.appendChild(msColor);

    // Optimize touch targets
    const style = document.createElement('style');
    style.textContent = `
      /* Mobile-friendly touch targets */
      @media (max-width: 768px) {
        button, a, [role="button"] {
          min-height: 44px;
          min-width: 44px;
        }
        
        /* Improve tap responsiveness */
        * {
          -webkit-tap-highlight-color: rgba(37, 99, 235, 0.2);
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Prevent zoom on input focus */
        input, select, textarea {
          font-size: 16px;
        }
        
        /* Optimize images for mobile */
        img {
          max-width: 100%;
          height: auto;
        }
      }
      
      /* Responsive text scaling */
      @media (max-width: 640px) {
        .text-4xl { font-size: 2.25rem; }
        .text-5xl { font-size: 3rem; }
        .text-6xl { font-size: 3.75rem; }
      }
      
      /* Loading optimization */
      img[data-src] {
        opacity: 0;
        transition: opacity 0.3s;
      }
      
      img[data-src].loaded {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);

    // Lazy loading for images
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });

    // Observe all images with data-src
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => imageObserver.observe(img));

    // Optimize font loading
    const fontPreload = document.createElement('link');
    fontPreload.rel = 'preload';
    fontPreload.as = 'font';
    fontPreload.type = 'font/woff2';
    fontPreload.crossOrigin = 'anonymous';
    fontPreload.href = 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2';
    document.head.appendChild(fontPreload);

    // Critical CSS inlining for above-the-fold content
    const criticalCSS = document.createElement('style');
    criticalCSS.textContent = `
      /* Critical above-the-fold styles */
      .hero-section {
        min-height: 60vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      .nav-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
      }
      
      /* Skeleton loading states */
      .skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
      }
      
      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `;
    document.head.appendChild(criticalCSS);

    // Performance monitoring
    if ('PerformanceObserver' in window) {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            console.log('Navigation timing:', entry);
          }
          if (entry.entryType === 'paint') {
            console.log(`${entry.name}:`, entry.startTime);
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation', 'paint'] });
    }

    return () => {
      // Cleanup observers
      imageObserver.disconnect();
    };
  }, []);

  return null;
}