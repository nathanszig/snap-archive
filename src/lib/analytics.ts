const UMAMI_WEBSITE_ID = "61578fb3-4b92-4ec1-9229-ad9dc2568eed";

declare global {
  interface Window {
    umami?: {
      track: (event: string, data?: Record<string, string>) => void;
    };
  }
}

export function trackEvent(event: string, data?: Record<string, string>): void {
  if (typeof window === "undefined") return;
  window.umami?.track(event, data);
}

export { UMAMI_WEBSITE_ID };
