import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initGA, trackPageView, isGAEnabled } from '@/lib/analytics';

/**
 * Google Analytics component
 * Add this component once in your app to enable GA tracking
 */
export function GoogleAnalytics() {
  const location = useLocation();

  // Initialize GA on mount
  useEffect(() => {
    if (isGAEnabled()) {
      initGA();
    }
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (isGAEnabled()) {
      trackPageView(location.pathname + location.search);
    }
  }, [location]);

  return null;
}
