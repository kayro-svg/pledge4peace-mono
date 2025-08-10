import { logger } from "./utils/logger";

// Use the environment variable if available, otherwise use the default URL for development
export const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// Log the API URL being used
logger.log(`[Config] Using API URL: ${API_URL}`);

export const API_ENDPOINTS = {
  auth: {
    register: `${API_URL}/auth/register`,
    login: `${API_URL}/auth/login`,
    verifyEmail: `${API_URL}/auth/verify-email`,
    forgotPassword: `${API_URL}/auth/forgot-password`,
    resetPassword: `${API_URL}/auth/reset-password`,
    profile: `${API_URL}/auth/profile`,
  },
  solutions: {
    create: `${API_URL}/solutions`,
    getById: (id: string) => `${API_URL}/solutions/${id}`,
    getByCampaign: (campaignId: string) =>
      `${API_URL}/solutions/campaign/${campaignId}`,
    update: (id: string) => `${API_URL}/solutions/${id}`,
    updateStatus: (id: string) => `${API_URL}/solutions/${id}/status`,
    approve: (id: string) => `${API_URL}/solutions/${id}/status`,
    reject: (id: string) => `${API_URL}/solutions/${id}/status`,
    moderationList: (params?: { status?: string; campaignId?: string }) => {
      const qs = new URLSearchParams();
      if (params?.status) qs.set("status", params.status);
      if (params?.campaignId) qs.set("campaignId", params.campaignId);
      const query = qs.toString();
      return `${API_URL}/solutions/moderation/list${query ? `?${query}` : ""}`;
    },
    like: (id: string) => `${API_URL}/solutions/${id}/like`,
    share: (id: string) => `${API_URL}/solutions/${id}/share`,
    campaignStats: (campaignId: string) =>
      `${API_URL}/solutions/campaign/${campaignId}/stats`,
    userInteractions: (id: string) =>
      `${API_URL}/solutions/${id}/user-interactions`,
  },
  comments: {
    create: (solutionId: string) =>
      `${API_URL}/solutions/${solutionId}/comments`,
    getBySolution: (solutionId: string) =>
      `${API_URL}/solutions/${solutionId}/comments`,
    update: (id: string) => `${API_URL}/solutions/comments/${id}`,
    delete: (id: string) => `${API_URL}/solutions/comments/${id}`,
  },
  pledges: {
    create: `${API_URL}/pledges`,
    getCount: (campaignId: string) =>
      `${API_URL}/campaigns/${campaignId}/pledges/count`,
  },
  homeStats: {
    getStats: `${API_URL}/stats`,
  },
  events: {
    register: `${API_URL}/events/register`,
    getRegistrationStatus: (eventId: string) =>
      `${API_URL}/events/registration-status/${eventId}`,
  },
  users: {
    subscribe: `${API_URL}/users/subscribe`,
    subscriptionStatus: `${API_URL}/users/subscription-status`,
    updateProfile: `${API_URL}/users/profile`,
  },
  userInvolvement: {
    dashboard: `${API_URL}/user-involvement/dashboard`,
    stats: `${API_URL}/user-involvement/stats`,
    activity: `${API_URL}/user-involvement/activity`,
    comments: `${API_URL}/user-involvement/comments`,
  },
};
