import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.middleware";
import { AdminAnalyticsController } from "../controllers/admin-analytics.controller";

const adminAnalytics = new Hono();
const controller = new AdminAnalyticsController();

// All routes require auth; controller checks role is moderator/admin/superAdmin
adminAnalytics.use("*", authMiddleware);

adminAnalytics.get("/campaign/:campaignId/summary", (c) =>
  controller.getCampaignSummary(c)
);
adminAnalytics.get("/campaign/:campaignId/timeseries", (c) =>
  controller.getCampaignTimeSeries(c)
);
adminAnalytics.get("/recent-activity", (c) => controller.getRecentActivity(c));
adminAnalytics.get("/global/summary", (c) => controller.getGlobalSummary(c));
adminAnalytics.get("/global/timeseries", (c) =>
  controller.getGlobalTimeSeries(c)
);
adminAnalytics.get("/campaign/:campaignId/pledges", (c) =>
  controller.getCampaignPledges(c)
);

export { adminAnalytics as adminAnalyticsRoutes };
