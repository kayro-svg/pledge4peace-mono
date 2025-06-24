import { useCallback } from "react";
import {
  trackEvent,
  trackPageView,
} from "@/components/analytics/google-analytics";
import {
  trackFacebookEvent,
  trackFacebookCustomEvent,
  trackFacebookPageView,
} from "@/components/analytics/facebook-pixel";

export const useAnalytics = () => {
  const track = useCallback(
    (eventName: string, parameters?: Record<string, unknown>) => {
      trackEvent(eventName, parameters);
      trackFacebookEvent(eventName, parameters);
    },
    []
  );

  const trackPage = useCallback((url: string) => {
    trackPageView(url);
    trackFacebookPageView();
  }, []);

  // Eventos comunes pre-definidos
  const trackButtonClick = useCallback(
    (buttonName: string, location?: string) => {
      track("button_click", {
        button_name: buttonName,
        location: location || "unknown",
      });
    },
    [track]
  );

  const trackFormSubmit = useCallback(
    (formName: string, success: boolean = true) => {
      track("form_submit", {
        form_name: formName,
        success: success,
      });
    },
    [track]
  );

  const trackPledgeCreated = useCallback(
    (pledgeId: string, category?: string) => {
      track("pledge_created", {
        pledge_id: pledgeId,
        category: category || "unknown",
      });
      // Facebook Pixel evento estándar para Lead
      trackFacebookEvent("Lead", {
        content_name: "Pledge Created",
        content_category: category || "unknown",
        value: 1,
        currency: "USD",
      });
    },
    [track]
  );

  const trackVolunteerRegistration = useCallback(
    (eventId?: string) => {
      track("volunteer_registration", {
        event_id: eventId || "general",
      });
      // Facebook Pixel evento estándar para CompleteRegistration
      trackFacebookEvent("CompleteRegistration", {
        content_name: "Volunteer Registration",
        event_id: eventId || "general",
      });
    },
    [track]
  );

  const trackCampaignView = useCallback(
    (campaignId: string, campaignName?: string) => {
      track("campaign_view", {
        campaign_id: campaignId,
        campaign_name: campaignName || "unknown",
      });
      // Facebook Pixel evento estándar para ViewContent
      trackFacebookEvent("ViewContent", {
        content_type: "campaign",
        content_ids: [campaignId],
        content_name: campaignName || "unknown",
      });
    },
    [track]
  );

  // Funciones específicas de Facebook Pixel
  const trackFacebookCustom = useCallback(
    (eventName: string, parameters?: Record<string, unknown>) => {
      trackFacebookCustomEvent(eventName, parameters);
    },
    []
  );

  return {
    track,
    trackPage,
    trackButtonClick,
    trackFormSubmit,
    trackPledgeCreated,
    trackVolunteerRegistration,
    trackCampaignView,
    trackFacebookCustom,
  };
};
