/**
 * Google Analytics 4 Integration
 * 
 * Usage:
 * 1. Add VITE_GA_MEASUREMENT_ID to your .env file
 * 2. Import and use trackPageView, trackEvent in your components
 */

type GtagFunction = {
  (command: 'js', date: Date): void;
  (command: 'config', targetId: string, config?: Record<string, unknown>): void;
  (command: 'event', eventName: string, params?: Record<string, unknown>): void;
};

declare global {
  interface Window {
    gtag?: GtagFunction;
    dataLayer?: unknown[];
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

/**
 * Initialize Google Analytics
 * Call this once when the app loads
 */
export const initGA = (): void => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics: Measurement ID not found in environment variables');
    return;
  }

  // Load gtag.js script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll handle page views manually with React Router
  });
};

/**
 * Track a page view
 * @param path - The page path (e.g., '/dashboard', '/clients')
 * @param title - Optional page title
 */
export const trackPageView = (path: string, title?: string): void => {
  if (!GA_MEASUREMENT_ID || !window.gtag) {
    return;
  }

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
  });
};

/**
 * Track a custom event
 * @param eventName - Name of the event (e.g., 'button_click', 'form_submit')
 * @param eventParams - Additional event parameters
 */
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>
): void => {
  if (!GA_MEASUREMENT_ID || !window.gtag) {
    return;
  }

  window.gtag('event', eventName, eventParams);
};

/**
 * Check if GA is enabled
 */
export const isGAEnabled = (): boolean => {
  return !!GA_MEASUREMENT_ID;
};
