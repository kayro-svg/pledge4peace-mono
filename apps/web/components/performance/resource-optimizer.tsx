"use client";

import { useEffect } from "react";

interface ResourceOptimizerProps {
  preloadFonts?: string[];
  preloadImages?: string[];
  deferScripts?: string[];
}

export function ResourceOptimizer({
  preloadFonts = [],
  preloadImages = [],
  deferScripts = [],
}: ResourceOptimizerProps) {
  useEffect(() => {
    // Preload critical fonts
    preloadFonts.forEach((font) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = font;
      link.as = "font";
      link.type = "font/woff2";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    });

    // Preload critical images
    preloadImages.forEach((image) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = image;
      link.as = "image";
      document.head.appendChild(link);
    });

    // Defer non-critical scripts
    deferScripts.forEach((script) => {
      const scriptElement = document.createElement("script");
      scriptElement.src = script;
      scriptElement.defer = true;
      document.head.appendChild(scriptElement);
    });

    // Performance monitoring only (no CSS removal to avoid conflicts with Vercel)
    const monitorPerformance = () => {
      if (process.env.NODE_ENV === 'development') {
        // Only log unused stylesheets in development for debugging
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        let unusedCount = 0;
        stylesheets.forEach((sheet) => {
          const href = (sheet as HTMLLinkElement).href;
          if (href && !href.includes('_next') && !href.includes('vercel')) {
            unusedCount++;
          }
        });
        if (unusedCount > 0) {
          console.log(`Found ${unusedCount} non-Vercel stylesheets for review`);
        }
      }
    };

    // Run performance monitoring only
    if (document.readyState === 'complete') {
      monitorPerformance();
    } else {
      window.addEventListener('load', monitorPerformance);
    }

    return () => {
      window.removeEventListener('load', monitorPerformance);
    };
  }, [preloadFonts, preloadImages, deferScripts]);

  return null; // This component doesn't render anything
}

// Hook for performance monitoring
export function usePerformanceMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Monitor Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (process.env.NODE_ENV === 'development') {
            console.log(`${entry.name}: ${entry.value}`);
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['measure', 'navigation', 'paint'] });
      } catch (e) {
        // Some browsers might not support all entry types
      }

      return () => {
        observer.disconnect();
      };
    }
  }, []);
}

// Component for critical resource hints (Vercel compatible)
export function CriticalResourceHints() {
  return (
    <>
      {/* DNS prefetch for external domains only (Vercel handles internal optimization) */}
      <link rel="dns-prefetch" href="//cdn.sanity.io" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      
      {/* Preconnect to critical external origins only */}
      <link rel="preconnect" href="https://cdn.sanity.io" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Note: Removed preload for local assets as Vercel optimizes these automatically */}
    </>
  );
}
