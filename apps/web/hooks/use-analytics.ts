import { useCallback } from "react";
import {
  trackEvent,
  trackPageView,
} from "@/components/analytics/google-analytics";

export const useAnalytics = () => {
  const track = useCallback(
    (eventName: string, parameters?: Record<string, unknown>) => {
      trackEvent(eventName, parameters);
    },
    []
  );

  const trackPage = useCallback((url: string) => {
    trackPageView(url);
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
    },
    [track]
  );

  const trackVolunteerRegistration = useCallback(
    (eventId?: string) => {
      track("volunteer_registration", {
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
    },
    [track]
  );

  return {
    track,
    trackPage,
    trackButtonClick,
    trackFormSubmit,
    trackPledgeCreated,
    trackVolunteerRegistration,
    trackCampaignView,
  };
};
