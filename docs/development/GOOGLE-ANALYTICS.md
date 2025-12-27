# Google Analytics 4 Integration

This guide explains how to set up and use Google Analytics 4 (GA4) in the FreelanceTracker application.

## Overview

The application includes built-in Google Analytics 4 integration that:
- Automatically tracks page views when users navigate between pages
- Provides utilities to track custom events
- Is disabled by default and requires configuration to enable
- Only loads when a valid Measurement ID is provided

## Setup

### 1. Create a Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Create a new property or use an existing one
4. Select **Google Analytics 4** (not Universal Analytics)
5. Complete the property setup wizard

### 2. Get Your Measurement ID

1. In Google Analytics, go to **Admin** (gear icon in bottom left)
2. Select your property
3. Click **Data Streams**
4. Select your web stream (or create one if it doesn't exist)
5. Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

### 3. Configure Environment Variables

Add your Measurement ID to your environment files:

**Development (`.env.local`):**
```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Production (`.env.production`):**
```bash
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Note:** If you leave `VITE_GA_MEASUREMENT_ID` empty or don't set it, Google Analytics will be disabled.

### 4. Restart Development Server

After adding the environment variable:
```bash
npm run dev
```

## How It Works

### Automatic Page Tracking

The `<GoogleAnalytics />` component in `App.tsx` automatically:
- Initializes GA4 when the app loads
- Tracks page views whenever the route changes
- Uses React Router's location to detect navigation

No additional code needed for basic page view tracking.

### Custom Event Tracking

To track custom events (button clicks, form submissions, etc.), use the `trackEvent` function:

```typescript
import { trackEvent } from '@/lib/analytics';

// Track a button click
function handleButtonClick() {
  trackEvent('button_click', {
    button_name: 'create_invoice',
    page: '/invoices'
  });
}

// Track form submission
function handleFormSubmit() {
  trackEvent('form_submit', {
    form_name: 'client_form',
    form_action: 'create'
  });
}

// Track feature usage
function handleFeatureUse() {
  trackEvent('feature_used', {
    feature: 'time_tracker',
    duration: 3600
  });
}
```

### Manual Page View Tracking

In most cases, automatic tracking is sufficient. However, if needed:

```typescript
import { trackPageView } from '@/lib/analytics';

trackPageView('/custom-page', 'Custom Page Title');
```

## Privacy Considerations

### GDPR Compliance

For European users, consider:
1. Adding a cookie consent banner
2. Only enabling GA after user consent
3. Respecting Do Not Track (DNT) headers
4. Providing opt-out functionality

### Data Anonymization

GA4 automatically anonymizes IP addresses. Additional privacy settings can be configured in your Google Analytics property settings.

### User Opt-Out

To implement user opt-out:

```typescript
// In your cookie consent component
import { trackEvent } from '@/lib/analytics';

function handleOptOut() {
  window[`ga-disable-${import.meta.env.VITE_GA_MEASUREMENT_ID}`] = true;
  trackEvent('analytics_opt_out');
}
```

## Verification

### Check if GA is Working

1. **Development Mode:**
   - Open browser DevTools → Network tab
   - Filter by "google-analytics.com" or "collect"
   - Navigate between pages
   - You should see requests to Google Analytics

2. **Real-time Reports:**
   - Open Google Analytics
   - Go to **Reports** → **Realtime**
   - Navigate your app
   - You should see yourself in the real-time view

3. **Debug Mode:**
   Add to your browser's console:
   ```javascript
   window.dataLayer
   ```
   This should show an array of GA events.

## Common Events to Track

Here are recommended events for a freelance tracking app:

```typescript
// User registration
trackEvent('sign_up', { method: 'email' });

// Client management
trackEvent('client_created');
trackEvent('client_updated');
trackEvent('client_deleted');

// Invoice actions
trackEvent('invoice_created', { amount: 1500, currency: 'EUR' });
trackEvent('invoice_sent', { invoice_id: 'INV-001' });
trackEvent('invoice_paid', { amount: 1500 });

// Time tracking
trackEvent('timer_start', { activity: 'development' });
trackEvent('timer_stop', { duration: 3600 });

// Feature usage
trackEvent('pdf_generated', { document_type: 'invoice' });
trackEvent('export_data', { format: 'csv' });
```

## Troubleshooting

### GA Not Loading

**Problem:** No requests to Google Analytics in Network tab

**Solutions:**
1. Check that `VITE_GA_MEASUREMENT_ID` is set in your `.env` file
2. Restart your development server after adding the variable
3. Verify the Measurement ID format (should be `G-XXXXXXXXXX`)
4. Check browser console for JavaScript errors

### Events Not Appearing

**Problem:** Events sent but not showing in GA

**Solutions:**
1. Wait 24-48 hours for data to appear in standard reports
2. Use Real-time reports for immediate verification
3. Check that your GA4 property is properly configured
4. Verify you're looking at the correct property in GA dashboard

### Ad Blockers

**Problem:** Ad blockers prevent GA from loading

**Solution:** This is expected behavior. GA won't work for users with ad blockers, which is normal and respects user privacy preferences.

## Files Reference

- **`src/lib/analytics.ts`** - Core GA4 utilities
- **`src/components/GoogleAnalytics.tsx`** - React component for tracking
- **`src/App.tsx`** - GA component integration
- **`.env.example`** - Environment variable template

## Additional Resources

- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/10089681)
- [GA4 Event Reference](https://support.google.com/analytics/answer/9267735)
- [GA4 Privacy & Compliance](https://support.google.com/analytics/topic/2919631)
