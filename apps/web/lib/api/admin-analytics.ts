import { apiClient } from "../api-client";

export type CampaignSummary = {
  success: true;
  data: {
    campaignId: string;
    solutionsPublished: number;
    interactions: { likes: number; dislikes: number; shares: number };
    comments: number;
    pledges: number;
    updatedAt: string;
  };
};

export type TimeSeriesPoint = {
  date: string;
  likes: number;
  dislikes: number;
  shares: number;
  comments: number;
  pledges: number;
};

export async function getCampaignSummary(campaignId: string) {
  return apiClient.get<CampaignSummary>(
    `/admin-analytics/campaign/${campaignId}/summary`
  );
}

export async function getCampaignTimeSeries(campaignId: string, days = 30) {
  return apiClient.get<{ success: true; data: TimeSeriesPoint[] }>(
    `/admin-analytics/campaign/${campaignId}/timeseries?days=${days}`
  );
}

export async function getRecentActivity(
  campaignId?: string,
  limit = 50,
  since?: string
) {
  const qs = new URLSearchParams();
  if (campaignId) qs.set("campaignId", campaignId);
  if (since) qs.set("since", since);
  qs.set("limit", String(limit));
  return apiClient.get<{
    success: true;
    data: Array<{ type: string; createdAt: string; meta: Record<string, any> }>;
  }>(`/admin-analytics/recent-activity?${qs.toString()}`);
}

export async function getGlobalSummary() {
  // Reuse CampaignSummary type; campaignId may be absent in global response
  return apiClient.get<CampaignSummary>(`/admin-analytics/global/summary`);
}

export async function getGlobalTimeSeries(days = 30) {
  return apiClient.get<{ success: true; data: TimeSeriesPoint[] }>(
    `/admin-analytics/global/timeseries?days=${days}`
  );
}

export async function getCampaignPledges(
  campaignId: string,
  page = 1,
  limit = 20,
  q?: string
) {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) qs.set("q", q);
  return apiClient.get<{
    success: true;
    data: {
      items: Array<{
        pledgeId: string;
        userId: string;
        createdAt: string;
        subscribeToUpdates: boolean;
        userName: string | null;
        userEmail: string | null;
      }>;
      page: number;
      limit: number;
      total: number;
    };
  }>(`/admin-analytics/campaign/${campaignId}/pledges?${qs.toString()}`);
}
