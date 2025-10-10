import { eq, and, or, like, desc, sql, inArray } from "drizzle-orm";
import {
  peaceSealCompanies,
  peaceSealReviews,
  peaceSealReviewVerifications,
} from "../db/schema/peace-seal";
import type { DbClient } from "../types";
import { HTTPException } from "hono/http-exception";

export interface CreateCompanyDTO {
  name: string;
  website?: string;
  country?: string;
  industry?: string;
}

export interface CreateReviewDTO {
  companyId: string;
  role: "employee" | "customer" | "investor" | "supplier";
  verificationMethod?: "email" | "linkedin" | "document" | "receipt" | "none";
  reviewerName?: string;
  reviewerEmail?: string;
  signedDisclosure: boolean;
  answers: Record<string, any>;
}

export interface ReviewFilters {
  companyId?: string;
  role?: string;
  verifiedOnly?: boolean;
  page?: number;
  limit?: number;
}

function now() {
  return new Date();
}

function ulid() {
  return `${Date.now()}-${crypto.randomUUID()}`;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Role-based section weights
const ROLE_WEIGHTS = {
  employee: {
    ethicalPracticesGovernance: 0.25,
    employeeRightsWorkplaceCulture: 0.3,
    socialImpactCommunityEngagement: 0.15,
    transparencyAccountability: 0.1,
    globalPeaceCommitment: 0.1,
    publicFeedbackReputation: 0.1,
  },
  customer: {
    ethicalPracticesGovernance: 0.2,
    socialImpactCommunityEngagement: 0.2,
    environmentalResponsibility: 0.2,
    transparencyAccountability: 0.2,
    publicFeedbackReputation: 0.2,
  },
  investor: {
    ethicalPracticesGovernance: 0.3,
    transparencyAccountability: 0.25,
    globalPeaceCommitment: 0.25,
    environmentalResponsibility: 0.1,
    publicFeedbackReputation: 0.1,
  },
  supplier: {
    ethicalPracticesGovernance: 0.25,
    supplyChainFairness: 0.25,
    transparencyAccountability: 0.2,
    globalPeaceCommitment: 0.2,
    publicFeedbackReputation: 0.1,
  },
};

// Section questions mapping
const SECTION_QUESTIONS = {
  ethicalPracticesGovernance: [
    "isTransparentOwnership",
    "hasAntiCorruptionPolicies",
    "avoidsConflictIndustries",
  ],
  employeeRightsWorkplaceCulture: [
    "fairWagesBenefits",
    "hasDeiPrograms",
    "protectsFromHarassment",
    "hasMentalHealthSupport",
  ],
  socialImpactCommunityEngagement: [
    "supportsCommunities",
    "encouragesVolunteering",
  ],
  environmentalResponsibility: [
    "takesSustainabilitySeriously",
    "avoidsHarmfulPractices",
  ],
  transparencyAccountability: ["reportsPublicly", "hasGrievanceSystem"],
  globalPeaceCommitment: ["avoidsConflictRegions", "hasPeaceCommitments"],
  publicFeedbackReputation: ["respondsToFeedback", "respectsStakeholders"],
  supplyChainFairness: ["fairSupplierTreatment", "transparentSupplyChain"],
};

export class CommunityReviewsService {
  constructor(private db: DbClient) {}

  // Create or find company for community listing
  async createOrFindCompany(data: CreateCompanyDTO, userId: string) {
    const { name, website, country, industry } = data;

    // Check if company already exists
    const existing = await this.db
      .select()
      .from(peaceSealCompanies)
      .where(
        or(
          eq(peaceSealCompanies.name, name),
          website ? eq(peaceSealCompanies.website, website) : sql`1=0`
        )
      )
      .then((r) => r[0]);

    if (existing) {
      // Mark as community listed if not already
      if (!existing.communityListed) {
        await this.db
          .update(peaceSealCompanies)
          .set({
            communityListed: 1,
            updatedAt: now(),
          })
          .where(eq(peaceSealCompanies.id, existing.id));
      }
      return existing;
    }

    // Create new company
    const id = crypto.randomUUID();
    const slug = slugify(`${name}-${id.slice(0, 6)}`);
    const nowTs = now();

    const company = await this.db
      .insert(peaceSealCompanies)
      .values({
        id,
        slug,
        name,
        website: website || null,
        country: country || null,
        industry: industry || null,
        status: "application_submitted", // Community listed companies start here
        communityListed: 1,
        createdByUserId: userId, // Use the actual user ID who added the company
        createdAt: nowTs,
        updatedAt: nowTs,
        paymentStatus: "pending",
        renewalReminderSent: 0,
      })
      .returning();

    return company[0];
  }

  // Create a review
  async createReview(data: CreateReviewDTO) {
    const {
      companyId,
      role,
      verificationMethod = "none",
      reviewerName,
      reviewerEmail,
      signedDisclosure,
      answers,
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

    // Calculate scores
    const { sectionScores, totalScore, starRating } = this.calculateScores(
      role,
      answers
    );

    // Determine verification status
    let verificationStatus: "pending" | "verified" | "unverified";
    if (verificationMethod === "email" && reviewerEmail) {
      verificationStatus = "pending";
    } else if (verificationMethod === "none") {
      verificationStatus = "unverified";
    } else {
      verificationStatus = "unverified";
    }

    const nowTs = now();
    const reviewId = crypto.randomUUID();

    // Create review
    const review = await this.db
      .insert(peaceSealReviews)
      .values({
        id: reviewId,
        companyId,
        role,
        verificationStatus,
        verificationMethod,
        reviewerName: reviewerName || null,
        reviewerEmail: reviewerEmail || null,
        signedDisclosure: signedDisclosure ? 1 : 0,
        answers: JSON.stringify(answers),
        sectionScores: JSON.stringify(sectionScores),
        totalScore,
        starRating,
        createdAt: nowTs,
        updatedAt: nowTs,
        verifiedAt: null, // Only set when verification is completed via email
      })
      .returning();

    // Send verification email if needed
    if (verificationStatus === "pending" && reviewerEmail) {
      await this.sendVerificationEmail(reviewId, reviewerEmail);
    }

    // Company aggregates will be updated when verification is completed

    return review[0];
  }

  // Calculate scores based on role and answers
  private calculateScores(role: string, answers: Record<string, any>) {
    const weights = ROLE_WEIGHTS[role as keyof typeof ROLE_WEIGHTS];
    if (!weights) {
      throw new HTTPException(400, { message: "Invalid role" });
    }

    const sectionScores: Record<string, number> = {};
    let totalScore = 0;

    // Calculate section scores
    for (const [section, weight] of Object.entries(weights)) {
      const questions =
        SECTION_QUESTIONS[section as keyof typeof SECTION_QUESTIONS];
      if (!questions) continue;

      let sectionTotal = 0;
      let answeredQuestions = 0;

      for (const question of questions) {
        const answer = answers[question];
        if (answer === "yes") {
          sectionTotal += 1;
          answeredQuestions += 1;
        } else if (answer === "no") {
          answeredQuestions += 1;
        }
        // "na" answers are excluded from calculation
      }

      const sectionScore =
        answeredQuestions > 0 ? (sectionTotal / answeredQuestions) * 100 : 0;
      sectionScores[section] = Math.round(sectionScore);
      totalScore += sectionScore * weight;
    }

    // Convert to star rating
    const finalScore = Math.round(totalScore);
    let starRating: number;
    if (finalScore >= 80) starRating = 5;
    else if (finalScore >= 60) starRating = 4;
    else if (finalScore >= 40) starRating = 3;
    else if (finalScore >= 20) starRating = 2;
    else starRating = 1;

    return { sectionScores, totalScore: finalScore, starRating };
  }

  // Send verification email
  private async sendVerificationEmail(reviewId: string, email: string) {
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    await this.db.insert(peaceSealReviewVerifications).values({
      id: ulid(),
      reviewId,
      token,
      expiresAt,
      createdAt: now(),
    });

    // TODO: Integrate with email service
    console.log(
      `Verification email would be sent to ${email} with token ${token}`
    );
  }

  // Confirm email verification
  async confirmVerification(token: string) {
    const verification = await this.db
      .select()
      .from(peaceSealReviewVerifications)
      .where(eq(peaceSealReviewVerifications.token, token))
      .then((r) => r[0]);

    if (!verification) {
      throw new HTTPException(404, { message: "Invalid verification token" });
    }

    if (verification.consumedAt) {
      throw new HTTPException(400, { message: "Token already used" });
    }

    if (verification.expiresAt < now()) {
      throw new HTTPException(400, { message: "Token expired" });
    }

    const nowTs = now();

    // Mark verification as consumed
    await this.db
      .update(peaceSealReviewVerifications)
      .set({ consumedAt: nowTs })
      .where(eq(peaceSealReviewVerifications.id, verification.id));

    // Update review as verified
    await this.db
      .update(peaceSealReviews)
      .set({
        verificationStatus: "verified",
        verifiedAt: nowTs,
        updatedAt: nowTs,
      })
      .where(eq(peaceSealReviews.id, verification.reviewId));

    // Get review to update aggregates
    const review = await this.db
      .select({ companyId: peaceSealReviews.companyId })
      .from(peaceSealReviews)
      .where(eq(peaceSealReviews.id, verification.reviewId))
      .then((r) => r[0]);

    if (review) {
      await this.recalcAggregates(review.companyId);
    }

    return { success: true };
  }

  // List reviews for a company
  async listCompanyReviews(filters: ReviewFilters) {
    const {
      companyId,
      role,
      verifiedOnly = false,
      page = 1,
      limit = 20,
    } = filters;

    if (!companyId) {
      throw new HTTPException(400, { message: "companyId is required" });
    }

    const offset = (page - 1) * Math.min(limit, 100);
    const where: any[] = [eq(peaceSealReviews.companyId, companyId)];

    if (role) where.push(eq(peaceSealReviews.role, role));
    if (verifiedOnly)
      where.push(eq(peaceSealReviews.verificationStatus, "verified"));

    const reviews = await this.db
      .select({
        id: peaceSealReviews.id,
        role: peaceSealReviews.role,
        verificationStatus: peaceSealReviews.verificationStatus,
        totalScore: peaceSealReviews.totalScore,
        starRating: peaceSealReviews.starRating,
        createdAt: peaceSealReviews.createdAt,
        verifiedAt: peaceSealReviews.verifiedAt,
        // Never expose PII
      })
      .from(peaceSealReviews)
      .where(where.length ? (and as any)(...where) : undefined)
      .orderBy(desc(peaceSealReviews.createdAt))
      .limit(Math.min(limit, 100))
      .offset(offset);

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(peaceSealReviews)
      .where(where.length ? (and as any)(...where) : undefined);

    const total = countResult[0]?.count || 0;

    return { items: reviews, page, limit: Math.min(limit, 100), total };
  }

  // Admin: List pending reviews for moderation
  async adminListReviews(filters: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { status = "pending", page = 1, limit = 20 } = filters;
    const offset = (page - 1) * Math.min(limit, 100);

    const where: any[] = [eq(peaceSealReviews.verificationStatus, status)];

    const reviews = await this.db
      .select({
        id: peaceSealReviews.id,
        companyId: peaceSealReviews.companyId,
        role: peaceSealReviews.role,
        verificationStatus: peaceSealReviews.verificationStatus,
        verificationMethod: peaceSealReviews.verificationMethod,
        totalScore: peaceSealReviews.totalScore,
        starRating: peaceSealReviews.starRating,
        createdAt: peaceSealReviews.createdAt,
        verifiedAt: peaceSealReviews.verifiedAt,
        // Include company name for admin view
        companyName: peaceSealCompanies.name,
      })
      .from(peaceSealReviews)
      .leftJoin(
        peaceSealCompanies,
        eq(peaceSealReviews.companyId, peaceSealCompanies.id)
      )
      .where(where.length ? (and as any)(...where) : undefined)
      .orderBy(desc(peaceSealReviews.createdAt))
      .limit(Math.min(limit, 100))
      .offset(offset);

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(peaceSealReviews)
      .where(where.length ? (and as any)(...where) : undefined);

    const total = countResult[0]?.count || 0;

    return { items: reviews, page, limit: Math.min(limit, 100), total };
  }

  // Admin: Verify or dismiss review
  async adminVerifyReview(
    reviewId: string,
    action: "verify" | "dismiss",
    adminUserId: string,
    notes?: string
  ) {
    const review = await this.db
      .select()
      .from(peaceSealReviews)
      .where(eq(peaceSealReviews.id, reviewId))
      .then((r) => r[0]);

    if (!review) {
      throw new HTTPException(404, { message: "Review not found" });
    }

    const nowTs = now();
    const verificationStatus = action === "verify" ? "verified" : "unverified";

    await this.db
      .update(peaceSealReviews)
      .set({
        verificationStatus,
        verifiedAt: action === "verify" ? nowTs : null,
        updatedAt: nowTs,
      })
      .where(eq(peaceSealReviews.id, reviewId));

    // Update aggregates
    await this.recalcAggregates(review.companyId);

    return { success: true };
  }

  // Recalculate company rating aggregates
  async recalcAggregates(companyId: string) {
    // Get all verified reviews
    const reviews = await this.db
      .select({
        role: peaceSealReviews.role,
        starRating: peaceSealReviews.starRating,
      })
      .from(peaceSealReviews)
      .where(
        and(
          eq(peaceSealReviews.companyId, companyId),
          eq(peaceSealReviews.verificationStatus, "verified")
        )
      );

    // Calculate employee rating
    const employeeReviews = reviews.filter((r) => r.role === "employee");
    const employeeRatingAvg =
      employeeReviews.length > 0
        ? Math.round(
            employeeReviews.reduce((sum, r) => sum + (r.starRating || 0), 0) /
              employeeReviews.length
          )
        : null;

    // Calculate overall rating
    const overallRatingAvg =
      reviews.length > 0
        ? Math.round(
            reviews.reduce((sum, r) => sum + (r.starRating || 0), 0) /
              reviews.length
          )
        : null;

    // Update company
    await this.db
      .update(peaceSealCompanies)
      .set({
        employeeRatingAvg,
        employeeRatingCount: employeeReviews.length,
        overallRatingAvg,
        overallRatingCount: reviews.length,
        updatedAt: now(),
      })
      .where(eq(peaceSealCompanies.id, companyId));

    return { success: true };
  }

  // Search companies for community listing
  async searchCompanies(query: string, limit = 10) {
    const companies = await this.db
      .select({
        id: peaceSealCompanies.id,
        slug: peaceSealCompanies.slug,
        name: peaceSealCompanies.name,
        country: peaceSealCompanies.country,
        website: peaceSealCompanies.website,
        industry: peaceSealCompanies.industry,
        status: peaceSealCompanies.status,
        communityListed: peaceSealCompanies.communityListed,
        employeeRatingAvg: peaceSealCompanies.employeeRatingAvg,
        employeeRatingCount: peaceSealCompanies.employeeRatingCount,
      })
      .from(peaceSealCompanies)
      .where(like(peaceSealCompanies.name, `%${query}%`))
      .limit(limit);

    return companies;
  }
}
