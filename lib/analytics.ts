// Analytics utility for tracking events across the platform

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Track a custom event in Google Analytics
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

/**
 * Track a page view
 */
export function trackPageView(url: string) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
    });
  }
}

// ── Conversion Events ──────────────────────────────────────────────────

export function trackSignUp(method: string = "email") {
  trackEvent("sign_up", "engagement", method);
}

export function trackLogin(method: string = "email") {
  trackEvent("login", "engagement", method);
}

export function trackSubscription(planName: string, value: number) {
  trackEvent("purchase", "ecommerce", planName, value);
  // Also fire a conversion event
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "conversion", {
      send_to: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      value: value,
      currency: "USD",
      transaction_id: `sub_${Date.now()}`,
    });
  }
}

export function trackTokenPurchase(tokenAmount: number, value: number) {
  trackEvent("purchase", "tokens", `${tokenAmount}_tokens`, value);
}

export function trackToolUsage(toolSlug: string) {
  trackEvent("tool_usage", "ai_tools", toolSlug);
}

export function trackAdWatch(adId: string, tokensEarned: number) {
  trackEvent("ad_watch", "engagement", adId, tokensEarned);
}

export function trackCheckoutStart(productType: string, productName: string) {
  trackEvent("begin_checkout", "ecommerce", `${productType}_${productName}`);
}
