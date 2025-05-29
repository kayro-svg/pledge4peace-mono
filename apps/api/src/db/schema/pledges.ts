import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const pledges = sqliteTable("pledges", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id").notNull(),
  userId: text("user_id").notNull(),  // Now required - user must be authenticated
  agreeToTerms: integer("agree_to_terms", { mode: "boolean" }).notNull(),
  subscribeToUpdates: integer("subscribe_to_updates", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  status: text("status", { enum: ["active", "removed"] })
    .notNull()
    .default("active"),
});

// Table to store campaign pledge counts
export const campaignPledgeCounts = sqliteTable("campaign_pledge_counts", {
  campaignId: text("campaign_id").primaryKey(),
  count: integer("count").notNull().default(0),
  lastUpdated: integer("last_updated", { mode: "timestamp" }).notNull(),
});
