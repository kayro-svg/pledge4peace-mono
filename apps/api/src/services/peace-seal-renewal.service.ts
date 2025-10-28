import { HTTPException } from "hono/http-exception";
import { createDb } from "../db";
import { Context } from "hono";
import { logger } from "../utils/logger";
import {
  peaceSealCompanies,
  peaceSealRenewals,
  peaceSealRewards,
  peaceSealCenterResources,
} from "../db/schema/peace-seal";
import { eq, and, desc, count, sql, gte, lte } from "drizzle-orm";

export interface RenewalData {
  companyId: string;
  renewalYear: number;
  amountCents: number;
  paymentTransactionId?: string;
  paymentDate?: number;
}

export interface RewardData {
  companyId: string;
  rewardType: string;
  status?: string;
  expiresAt?: number;
  metadata?: Record<string, any>;
}

export interface ResourceData {
  title: string;
  description?: string;
  resourceType: string;
  fileUrl?: string;
  category: string;
  isPublic?: boolean;
  accessLevel?: string;
}

export class PeaceSealRenewalService {
  constructor(private db: any) {}

  // Calculate renewal fee based on company size
  calculateRenewalFee(employeeCount?: number | null): number {
    if (!employeeCount) return 5000; // Default to small business fee

    if (employeeCount <= 20) {
      return 5000; // $50/year for small businesses
    } else if (employeeCount <= 50) {
      return 25000; // $250/year for medium businesses
    } else {
      // For large businesses, return 50% of original subscription
      // This would need to be calculated based on the original payment amount
      return 25000; // Default to medium business fee for now
    }
  }

  // Determine badge level based on score
  determineBadgeLevel(score?: number | null): string | null {
    if (!score || score < 70) return null;
    if (score >= 100) return "gold";
    if (score >= 90) return "silver";
    return "bronze";
  }

  // Create renewal record
  async createRenewal(data: RenewalData) {
    const {
      companyId,
      renewalYear,
      amountCents,
      paymentTransactionId,
      paymentDate,
    } = data;

    // Verify company exists
    const company = await this.db
      .select()
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.id, companyId))
      .then((r) => r[0]);

    if (!company) {
      throw new HTTPException(404, { message: "Company not found" });
    }

    // Check if renewal already exists for this year
    const existingRenewal = await this.db
      .select()
      .from(peaceSealRenewals)
      .where(
        and(
          eq(peaceSealRenewals.companyId, companyId),
          eq(peaceSealRenewals.renewalYear, renewalYear)
        )
      )
      .then((r) => r[0]);

    if (existingRenewal) {
      throw new HTTPException(400, {
        message: "Renewal already exists for this year",
      });
    }

    const nowTs = Date.now();
    const renewalId = crypto.randomUUID();

    // Calculate expiration date (1 year from now)
    const expiresAt = nowTs + 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

    const renewal = await this.db
      .insert(peaceSealRenewals)
      .values({
        id: renewalId,
        companyId,
        renewalYear,
        amountCents,
        paymentStatus: paymentTransactionId ? "paid" : "pending",
        paymentTransactionId: paymentTransactionId || null,
        paymentDate: paymentDate || null,
        expiresAt,
        createdAt: nowTs,
        updatedAt: nowTs,
      })
      .returning();

    // Update company with renewal information
    await this.db
      .update(peaceSealCompanies)
      .set({
        renewalAmountCents: amountCents,
        renewalDueDate: expiresAt,
        updatedAt: nowTs,
      })
      .where(eq(peaceSealCompanies.id, companyId));

    // If payment is provided, activate Peace Seal Center access
    if (paymentTransactionId) {
      await this.activatePeaceSealCenterAccess(companyId);
      await this.grantRenewalRewards(companyId, renewalYear);
    }

    return renewal[0];
  }

  // Activate Peace Seal Center access
  async activatePeaceSealCenterAccess(companyId: string) {
    const nowTs = Date.now();

    await this.db
      .update(peaceSealCompanies)
      .set({
        peaceSealCenterAccess: 1,
        updatedAt: nowTs,
      })
      .where(eq(peaceSealCompanies.id, companyId));

    logger.log(`Peace Seal Center access activated for company ${companyId}`);
  }

  // Grant renewal rewards
  async grantRenewalRewards(companyId: string, renewalYear: number) {
    const nowTs = Date.now();
    const expiresAt = nowTs + 365 * 24 * 60 * 60 * 1000; // 1 year

    const rewards = [
      {
        rewardType: "digital_badge",
        status: "delivered",
        deliveredAt: nowTs,
        expiresAt,
        metadata: JSON.stringify({
          renewalYear,
          badgeLevel: "renewed",
          downloadUrl: `/api/peace-seal/badges/${companyId}/digital`,
        }),
      },
      {
        rewardType: "certificate",
        status: "delivered",
        deliveredAt: nowTs,
        expiresAt,
        metadata: JSON.stringify({
          renewalYear,
          downloadUrl: `/api/peace-seal/certificates/${companyId}/digital`,
        }),
      },
      {
        rewardType: "brand_toolkit",
        status: "delivered",
        deliveredAt: nowTs,
        expiresAt,
        metadata: JSON.stringify({
          renewalYear,
          includes: ["social_media_templates", "graphics", "guidelines"],
        }),
      },
      {
        rewardType: "network_access",
        status: "delivered",
        deliveredAt: nowTs,
        expiresAt,
        metadata: JSON.stringify({
          renewalYear,
          accessLevel: "certified_member",
        }),
      },
    ];

    for (const reward of rewards) {
      const rewardId = crypto.randomUUID();
      await this.db.insert(peaceSealRewards).values({
        id: rewardId,
        companyId,
        ...reward,
        createdAt: nowTs,
        updatedAt: nowTs,
      });
    }

    logger.log(
      `Renewal rewards granted for company ${companyId}, year ${renewalYear}`
    );
  }

  // Get company renewals
  async getCompanyRenewals(companyId: string) {
    const renewals = await this.db
      .select()
      .from(peaceSealRenewals)
      .where(eq(peaceSealRenewals.companyId, companyId))
      .orderBy(desc(peaceSealRenewals.renewalYear));

    return renewals;
  }

  // Get company rewards
  async getCompanyRewards(companyId: string) {
    const rewards = await this.db
      .select()
      .from(peaceSealRewards)
      .where(eq(peaceSealRewards.companyId, companyId))
      .orderBy(desc(peaceSealRewards.createdAt));

    return rewards.map((reward) => ({
      ...reward,
      metadata: reward.metadata ? JSON.parse(reward.metadata) : null,
    }));
  }

  // Get Peace Seal Center resources
  async getPeaceSealCenterResources(accessLevel: string = "certified") {
    const resources = await this.db
      .select()
      .from(peaceSealCenterResources)
      .where(
        and(
          eq(peaceSealCenterResources.isPublic, 1),
          eq(peaceSealCenterResources.accessLevel, accessLevel)
        )
      )
      .orderBy(desc(peaceSealCenterResources.createdAt));

    return resources;
  }

  // Add Peace Seal Center resource
  async addPeaceSealCenterResource(data: ResourceData) {
    const {
      title,
      description,
      resourceType,
      fileUrl,
      category,
      isPublic = false,
      accessLevel = "certified",
    } = data;

    const nowTs = Date.now();
    const resourceId = crypto.randomUUID();

    const resource = await this.db
      .insert(peaceSealCenterResources)
      .values({
        id: resourceId,
        title,
        description: description || null,
        resourceType,
        fileUrl: fileUrl || null,
        category,
        isPublic: isPublic ? 1 : 0,
        accessLevel,
        createdAt: nowTs,
        updatedAt: nowTs,
      })
      .returning();

    return resource[0];
  }

  // Check for expiring renewals
  async getExpiringRenewals(daysAhead: number = 30) {
    const futureDate = Date.now() + daysAhead * 24 * 60 * 60 * 1000;

    const expiringRenewals = await this.db
      .select({
        id: peaceSealRenewals.id,
        companyId: peaceSealRenewals.companyId,
        renewalYear: peaceSealRenewals.renewalYear,
        expiresAt: peaceSealRenewals.expiresAt,
        paymentStatus: peaceSealRenewals.paymentStatus,
        // Company details
        companyName: peaceSealCompanies.name,
        companyEmail: peaceSealCompanies.createdByUserId, // This would need to be joined with users table
        renewalAmountCents: peaceSealCompanies.renewalAmountCents,
      })
      .from(peaceSealRenewals)
      .innerJoin(
        peaceSealCompanies,
        eq(peaceSealRenewals.companyId, peaceSealCompanies.id)
      )
      .where(
        and(
          eq(peaceSealRenewals.paymentStatus, "paid"),
          lte(peaceSealRenewals.expiresAt, futureDate),
          gte(peaceSealRenewals.expiresAt, Date.now())
        )
      )
      .orderBy(peaceSealRenewals.expiresAt);

    return expiringRenewals;
  }

  // Process renewal payment
  async processRenewalPayment(
    companyId: string,
    renewalYear: number,
    paymentTransactionId: string,
    paymentDate: number
  ) {
    const nowTs = Date.now();

    // Update renewal record
    await this.db
      .update(peaceSealRenewals)
      .set({
        paymentStatus: "paid",
        paymentTransactionId,
        paymentDate,
        updatedAt: nowTs,
      })
      .where(
        and(
          eq(peaceSealRenewals.companyId, companyId),
          eq(peaceSealRenewals.renewalYear, renewalYear)
        )
      );

    // Activate Peace Seal Center access
    await this.activatePeaceSealCenterAccess(companyId);

    // Grant renewal rewards
    await this.grantRenewalRewards(companyId, renewalYear);

    logger.log(
      `Renewal payment processed for company ${companyId}, year ${renewalYear}`
    );

    return { success: true };
  }

  // Update badge level based on score
  async updateBadgeLevel(companyId: string, score: number) {
    const badgeLevel = this.determineBadgeLevel(score);
    const nowTs = Date.now();

    await this.db
      .update(peaceSealCompanies)
      .set({
        badgeLevel,
        score,
        updatedAt: nowTs,
      })
      .where(eq(peaceSealCompanies.id, companyId));

    // If company achieved a badge level, grant digital badge reward
    if (badgeLevel) {
      await this.grantDigitalBadgeReward(companyId, badgeLevel);
    }

    return { badgeLevel, score };
  }

  // Grant digital badge reward
  async grantDigitalBadgeReward(companyId: string, badgeLevel: string) {
    const nowTs = Date.now();
    const expiresAt = nowTs + 365 * 24 * 60 * 60 * 1000; // 1 year

    const rewardId = crypto.randomUUID();
    await this.db.insert(peaceSealRewards).values({
      id: rewardId,
      companyId,
      rewardType: "digital_badge",
      status: "delivered",
      deliveredAt: nowTs,
      expiresAt,
      metadata: JSON.stringify({
        badgeLevel,
        downloadUrl: `/api/peace-seal/badges/${companyId}/digital`,
        badgeType: "certification",
      }),
      createdAt: nowTs,
      updatedAt: nowTs,
    });

    // Update company with digital badge URL
    await this.db
      .update(peaceSealCompanies)
      .set({
        digitalBadgeUrl: `/api/peace-seal/badges/${companyId}/digital`,
        updatedAt: nowTs,
      })
      .where(eq(peaceSealCompanies.id, companyId));

    logger.log(
      `Digital badge reward granted for company ${companyId}, level ${badgeLevel}`
    );
  }

  // Request physical badge
  async requestPhysicalBadge(companyId: string) {
    const nowTs = Date.now();

    // Update company record
    await this.db
      .update(peaceSealCompanies)
      .set({
        physicalBadgeRequested: 1,
        updatedAt: nowTs,
      })
      .where(eq(peaceSealCompanies.id, companyId));

    // Create reward record
    const rewardId = crypto.randomUUID();
    await this.db.insert(peaceSealRewards).values({
      id: rewardId,
      companyId,
      rewardType: "physical_badge",
      status: "pending",
      metadata: JSON.stringify({
        requestedAt: nowTs,
        shippingStatus: "pending",
      }),
      createdAt: nowTs,
      updatedAt: nowTs,
    });

    logger.log(`Physical badge requested for company ${companyId}`);

    return { success: true };
  }
}
