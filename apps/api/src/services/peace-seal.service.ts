import { eq, and, or, like, desc, sql, inArray } from "drizzle-orm";
import {
  peaceSealCompanies,
  peaceSealQuestionnaires,
  peaceSealStatusHistory,
  peaceSealReports,
  peaceSealDocuments,
} from "../db/schema/peace-seal";
import { users } from "../db/schema/users";
import type { DbClient } from "../types";
import { HTTPException } from "hono/http-exception";
import {
  PEACE_SEAL_STATUS,
  PAYMENT_STATUS,
  BUSINESS_RULES,
  SCORE_THRESHOLDS,
  isValidStatus,
  canTransitionStatus,
  getStatusFromScore,
  getPaymentAmount,
  getPaymentAmountByEmployees,
  type PeaceSealStatus,
} from "../types/peace-seal";
import {
  parseQuestionnaireResponses,
  getQuestionnaireStats,
} from "../utils/questionnaire-parser";

export interface CreateApplicationDTO {
  name: string;
  country?: string;
  website?: string;
  industry?: string;
  employeeCount?: number;
  createdByUserId: string;
}

export interface UpdateQuestionnaireDTO {
  companyId: string;
  responses: any;
  progress: number;
  userId: string;
}

export interface AdminUpdateDTO {
  companyId: string;
  status?: string;
  score?: number;
  notes?: string;
  advisorUserId?: string;
  changedByUserId: string;
}

export interface DirectoryFilters {
  q?: string;
  country?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface AdminFilters extends DirectoryFilters {
  assignedToMe?: boolean;
  userId?: string;
  userRole?: string;
  communityListed?: boolean;
}

export interface CreateReportDTO {
  companyId: string;
  reporterEmail?: string;
  reporterName?: string;
  reason: string;
  description?: string;
  evidence?: string;
}

function now() {
  return new Date(); // Return Date object for Drizzle timestamp mode
}

function ulid() {
  // Simple ULID-ish fallback for D1 ordering
  return `${Date.now()}-${crypto.randomUUID()}`;
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export class PeaceSealService {
  constructor(private db: DbClient) {}

  // Public directory with search/filter
  async getDirectory(filters: DirectoryFilters) {
    const { q, country, status, page = 1, limit = 100 } = filters;
    const offset = (page - 1) * Math.min(limit, 100);

    const where: any[] = [];
    // Exclude draft applications from public directory
    // where.push(sql`${peaceSealCompanies.status} != ${PEACE_SEAL_STATUS.DRAFT}`);

    // Show companies with completed questionnaires OR community listed companies
    // where.push(sql`(
    //   ${peaceSealCompanies.id} in (
    //     select company_id from peace_seal_questionnaires
    //     where progress >= 100
    //   ) OR ${peaceSealCompanies.communityListed} = 1
    // )`);

    if (q) where.push(like(peaceSealCompanies.name, `%${q}%`));
    if (country) where.push(eq(peaceSealCompanies.country, country));
    if (status) where.push(eq(peaceSealCompanies.status, status));

    const items = await this.db
      .select({
        id: peaceSealCompanies.id,
        slug: peaceSealCompanies.slug,
        name: peaceSealCompanies.name,
        country: peaceSealCompanies.country,
        status: peaceSealCompanies.status,
        lastReviewedAt: peaceSealCompanies.lastReviewedAt,
        notes: peaceSealCompanies.notes,
        score: peaceSealCompanies.score,
        communityListed: peaceSealCompanies.communityListed,
        employeeRatingAvg: peaceSealCompanies.employeeRatingAvg,
        employeeRatingCount: peaceSealCompanies.employeeRatingCount,
        overallRatingAvg: peaceSealCompanies.overallRatingAvg,
        overallRatingCount: peaceSealCompanies.overallRatingCount,
      })
      .from(peaceSealCompanies)
      .where(where.length ? (and as any)(...where) : undefined)
      .orderBy(desc(peaceSealCompanies.updatedAt))
      .limit(Math.min(limit, 100))
      .offset(offset);

    return { items };
  }

  // Get company by slug (public)
  async getCompanyBySlug(slug: string) {
    const company = await this.db
      .select()
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.slug, slug))
      .then((r) => r[0]);

    if (!company) {
      throw new HTTPException(404, { message: "Company not found" });
    }

    return company;
  }

  // Start new application
  async createApplication(data: CreateApplicationDTO) {
    const id = crypto.randomUUID();
    const slug = slugify(`${data.name}-${id.slice(0, 6)}`);
    const nowTs = now();

    // Calculate expected payment amount based on employee count
    const expectedAmount = data.employeeCount
      ? getPaymentAmountByEmployees(data.employeeCount)
      : BUSINESS_RULES.PAYMENT_SMALL_COMPANY;

    const application = await this.db
      .insert(peaceSealCompanies)
      .values({
        id,
        slug,
        name: data.name,
        country: data.country || null,
        website: data.website || null,
        industry: data.industry || null,
        employeeCount: data.employeeCount || null,
        status: PEACE_SEAL_STATUS.DRAFT, // Start as draft until payment is completed
        createdByUserId: data.createdByUserId,
        createdAt: nowTs,
        updatedAt: nowTs,
        paymentStatus: PAYMENT_STATUS.PENDING,
        renewalReminderSent: 0,
      })
      .returning();

    return { ...application[0], expectedPaymentAmount: expectedAmount };
  }

  // Confirm payment and assign advisor
  async confirmPayment(
    companyId: string,
    transactionId: string,
    amountCents: number,
    userId: string
  ) {
    // Verify ownership and get company details
    const company = await this.db
      .select({
        createdByUserId: peaceSealCompanies.createdByUserId,
        employeeCount: peaceSealCompanies.employeeCount,
        paymentStatus: peaceSealCompanies.paymentStatus,
      })
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.id, companyId))
      .then((r) => r[0]);

    if (!company) {
      throw new HTTPException(404, { message: "Company not found" });
    }

    // For webhook calls, userId will be the company owner's ID
    // For direct user calls, userId should match the company owner
    if (company.createdByUserId !== userId) {
      throw new HTTPException(403, { message: "Not allowed" });
    }

    // Verify payment already not processed
    if (company.paymentStatus === PAYMENT_STATUS.PAID) {
      // Payment already confirmed - return success instead of error
      // This allows both immediate confirmation and webhook to work
      return { success: true, message: "Payment already confirmed" };
    }

    // Validate payment amount matches expected amount using new pricing tiers
    const expectedAmount = company.employeeCount
      ? getPaymentAmountByEmployees(company.employeeCount)
      : BUSINESS_RULES.PAYMENT_SMALL_COMPANY;

    // Block RFQ companies from paying online
    if (expectedAmount === null) {
      throw new HTTPException(400, {
        message:
          "Companies with more than 50 employees must request a quote and cannot pay online",
      });
    }

    if (Math.abs(amountCents - expectedAmount) > 100) {
      // Allow $1 tolerance for fees
      throw new HTTPException(400, {
        message: `Payment amount ${amountCents} does not match expected ${expectedAmount}`,
      });
    }

    const nowTs = now();

    // Calculate expiration date (1 year from payment)
    const expiresAt = new Date(nowTs);
    expiresAt.setDate(
      expiresAt.getDate() + BUSINESS_RULES.CERTIFICATION_DURATION_DAYS
    );

    // Update payment status and change application status to submitted
    await this.db
      .update(peaceSealCompanies)
      .set({
        paymentStatus: PAYMENT_STATUS.PAID,
        paymentAmountCents: amountCents,
        paymentTransactionId: transactionId,
        paymentDate: nowTs,
        expiresAt,
        status: PEACE_SEAL_STATUS.APPLICATION_SUBMITTED, // Change from DRAFT to APPLICATION_SUBMITTED
        updatedAt: nowTs,
      })
      .where(eq(peaceSealCompanies.id, companyId));

    // Assign advisor automatically
    await this.assignAdvisorAutomatically(companyId, userId);

    return { success: true };
  }

  async requestQuote(applicationId: string, employeeCount: number) {
    const company = await this.db
      .select()
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.id, applicationId))
      .then((r) => r[0]);

    if (!company) {
      throw new HTTPException(404, { message: "Application not found" });
    }

    // Mark as RFQ requested
    const nowTs = now();
    await this.db
      .update(peaceSealCompanies)
      .set({
        rfqStatus: "requested",
        rfqRequestedAt: nowTs,
        updatedAt: nowTs,
      })
      .where(eq(peaceSealCompanies.id, applicationId));

    return company;
  }

  // Admin: Confirm manual payment for RFQ companies
  async adminConfirmPayment(
    companyId: string,
    amountCents: number,
    transactionId: string | null,
    adminUserId: string
  ) {
    // Get company details
    const company = await this.db
      .select()
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.id, companyId))
      .then((r) => r[0]);

    if (!company) {
      throw new HTTPException(404, { message: "Company not found" });
    }

    // Verify payment not already processed
    if (company.paymentStatus === PAYMENT_STATUS.PAID) {
      return { success: true, message: "Payment already confirmed" };
    }

    const nowTs = now();

    // Calculate expiration date (1 year from payment)
    const expiresAt = new Date(nowTs);
    expiresAt.setDate(
      expiresAt.getDate() + BUSINESS_RULES.CERTIFICATION_DURATION_DAYS
    );

    // Update payment status
    await this.db
      .update(peaceSealCompanies)
      .set({
        paymentStatus: PAYMENT_STATUS.PAID,
        paymentAmountCents: amountCents,
        paymentTransactionId: transactionId,
        paymentDate: nowTs,
        expiresAt,
        status: PEACE_SEAL_STATUS.APPLICATION_SUBMITTED,
        updatedAt: nowTs,
      })
      .where(eq(peaceSealCompanies.id, companyId));

    // Assign advisor automatically
    await this.assignAdvisorAutomatically(companyId, adminUserId);

    // Record in history
    await this.db.insert(peaceSealStatusHistory).values({
      id: ulid(),
      companyId,
      status: PEACE_SEAL_STATUS.APPLICATION_SUBMITTED,
      notes: `Payment confirmed manually by admin - Amount: $${amountCents / 100}`,
      changedByUserId: adminUserId,
      createdAt: nowTs,
    });

    return { success: true };
  }

  // Auto-assign advisor to company
  private async assignAdvisorAutomatically(
    companyId: string,
    fallbackUserId: string
  ) {
    const activeStatuses = [
      PEACE_SEAL_STATUS.AUDIT_IN_PROGRESS,
      PEACE_SEAL_STATUS.UNDER_REVIEW,
    ] as const;
    // Find advisor with least workload (excluding advisors with >10 active cases)
    const advisors = await this.db
      .select({
        userId: users.id,
        assignedCount: sql<number>`count(${peaceSealCompanies.advisorUserId})`,
      })
      .from(users)
      .leftJoin(
        peaceSealCompanies,
        and(
          eq(peaceSealCompanies.advisorUserId, users.id),
          inArray(peaceSealCompanies.status, activeStatuses) // ← correcto
        )
      )
      .where(eq(users.role, "advisor"))
      .groupBy(users.id)
      .having(sql`count(${peaceSealCompanies.advisorUserId}) < 10`)
      .orderBy(sql`count(${peaceSealCompanies.advisorUserId})`)
      .limit(1);

    if (advisors[0]) {
      const nowTs = now();

      await this.db
        .update(peaceSealCompanies)
        .set({
          advisorUserId: advisors[0].userId,
          status: PEACE_SEAL_STATUS.AUDIT_IN_PROGRESS,
          updatedAt: nowTs,
        })
        .where(eq(peaceSealCompanies.id, companyId));

      // Record status change in history
      await this.db.insert(peaceSealStatusHistory).values({
        id: ulid(),
        companyId,
        status: PEACE_SEAL_STATUS.AUDIT_IN_PROGRESS,
        notes: "Advisor assigned automatically after payment confirmation",
        changedByUserId: advisors[0].userId,
        createdAt: nowTs,
      });
    } else {
      // No available advisors - keep application submitted and record a history note.
      const nowTs = now();
      await this.db
        .update(peaceSealCompanies)
        .set({
          status: PEACE_SEAL_STATUS.APPLICATION_SUBMITTED,
          updatedAt: nowTs,
        })
        .where(eq(peaceSealCompanies.id, companyId));

      await this.db.insert(peaceSealStatusHistory).values({
        id: ulid(),
        companyId,
        status: PEACE_SEAL_STATUS.APPLICATION_SUBMITTED,
        notes:
          "No advisors available at the moment. Application queued for assignment.",
        changedByUserId: fallbackUserId, // Use the company owner instead of "system"
        createdAt: nowTs,
      });
      // Do not throw; allow payment confirmation to succeed.
    }
  }

  // Save questionnaire responses
  async saveQuestionnaire(data: UpdateQuestionnaireDTO) {
    const { companyId, responses, progress, userId } = data;

    // Verify ownership
    const company = await this.db
      .select({ createdByUserId: peaceSealCompanies.createdByUserId })
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.id, companyId))
      .then((r) => r[0]);

    if (!company || company.createdByUserId !== userId) {
      throw new HTTPException(403, { message: "Not allowed" });
    }

    // Check if questionnaire exists
    const existing = await this.db
      .select({ id: peaceSealQuestionnaires.id })
      .from(peaceSealQuestionnaires)
      .where(eq(peaceSealQuestionnaires.companyId, companyId))
      .then((r) => r[0]);

    const nowTs = now();
    const payload = {
      companyId,
      responses:
        typeof responses === "string"
          ? responses
          : JSON.stringify(responses || {}),
      progress: Math.max(0, Math.min(100, progress || 0)),
      updatedAt: nowTs,
      completedAt: progress >= 100 ? nowTs : null,
    } as any;

    if (existing) {
      await this.db
        .update(peaceSealQuestionnaires)
        .set(payload)
        .where(eq(peaceSealQuestionnaires.id, existing.id));
    } else {
      await this.db.insert(peaceSealQuestionnaires).values({
        id: ulid(),
        version: 1,
        createdAt: nowTs,
        ...payload,
      });
    }

    // If questionnaire is completed, update status to indicate it's ready for advisor review
    if (progress >= 100) {
      // Get current company status and payment info to determine appropriate next status
      const currentCompany = await this.db
        .select({
          status: peaceSealCompanies.status,
          advisorUserId: peaceSealCompanies.advisorUserId,
          paymentStatus: peaceSealCompanies.paymentStatus,
        })
        .from(peaceSealCompanies)
        .where(eq(peaceSealCompanies.id, companyId))
        .then((r) => r[0]);

      let newStatus = currentCompany?.status;
      let statusNote = "Questionnaire completed";
      let preliminaryScore: number | null = null;

      // Determine appropriate status based on current state
      if (currentCompany?.status === PEACE_SEAL_STATUS.DRAFT) {
        // If still in draft, move to application submitted (needs payment first)
        newStatus = PEACE_SEAL_STATUS.APPLICATION_SUBMITTED;
        statusNote =
          "Questionnaire completed - application submitted for review";
      } else if (
        currentCompany?.status === PEACE_SEAL_STATUS.APPLICATION_SUBMITTED
      ) {
        // Keep as application_submitted - no auto-transition to under_review
        newStatus = PEACE_SEAL_STATUS.APPLICATION_SUBMITTED;
        statusNote =
          "Questionnaire completed - application submitted for review";

        // If payment is completed, calculate preliminary score for directory display
        if (currentCompany.paymentStatus === PAYMENT_STATUS.PAID) {
          preliminaryScore = this.calculateScore(responses);
          statusNote += ` - Preliminary score: ${preliminaryScore}/100`;
        }
      } else if (
        currentCompany?.status === PEACE_SEAL_STATUS.AUDIT_IN_PROGRESS
      ) {
        // Already in audit, keep same status but update note
        newStatus = PEACE_SEAL_STATUS.AUDIT_IN_PROGRESS;
        statusNote = "Questionnaire updated - ready for advisor review";
      }

      // Update company status and preliminary score (if paid)
      const updatePayload: any = {
        status: newStatus,
        updatedAt: nowTs,
      };

      // Only set preliminary score if payment is completed and questionnaire is done
      if (
        preliminaryScore !== null &&
        currentCompany?.paymentStatus === PAYMENT_STATUS.PAID
      ) {
        updatePayload.score = preliminaryScore;
      }

      await this.db
        .update(peaceSealCompanies)
        .set(updatePayload)
        .where(eq(peaceSealCompanies.id, companyId));

      // Record in history (with preliminary score if applicable)
      await this.db.insert(peaceSealStatusHistory).values({
        id: ulid(),
        companyId,
        status: newStatus,
        score: preliminaryScore, // Preliminary score for paid companies
        notes: statusNote,
        changedByUserId: userId,
        createdAt: nowTs,
      });
    }

    return { success: true };
  }

  // Advisor: Manually review and score questionnaire
  async advisorScoreQuestionnaire(
    companyId: string,
    advisorUserId: string,
    advisorRole: string,
    manualScore: number,
    notes?: string
  ) {
    // Permission check - only advisors and above can score
    if (!["advisor", "admin", "superAdmin"].includes(advisorRole)) {
      throw new HTTPException(403, {
        message: "Only advisors can score questionnaires",
      });
    }

    // Validate manual score - it's now required
    if (
      typeof manualScore !== "number" ||
      manualScore < 0 ||
      manualScore > 100
    ) {
      throw new HTTPException(400, {
        message: "Manual score is required and must be between 0 and 100",
      });
    }

    // Get company and questionnaire
    const company = await this.db
      .select()
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.id, companyId))
      .then((r) => r[0]);

    if (!company) {
      throw new HTTPException(404, { message: "Company not found" });
    }

    // Enforce payment requirement for advisor scoring
    if (company.paymentStatus !== PAYMENT_STATUS.PAID) {
      throw new HTTPException(400, {
        message:
          "Payment must be completed before advisor can score questionnaire",
      });
    }

    const questionnaire = await this.db
      .select()
      .from(peaceSealQuestionnaires)
      .where(eq(peaceSealQuestionnaires.companyId, companyId))
      .then((r) => r[0]);

    if (!questionnaire || questionnaire.progress < 100) {
      throw new HTTPException(400, { message: "Questionnaire not completed" });
    }

    // Determine status based on manual score
    const { status: newStatus, shouldSetVerifiedAt } =
      this.getStatusFromScore(manualScore);

    const nowTs = now();
    const updatePayload: any = {
      score: manualScore,
      status: newStatus,
      lastReviewedAt: nowTs,
      updatedAt: nowTs,
      advisorUserId: advisorUserId, // Assign advisor to company
    };

    if (typeof notes === "string") updatePayload.notes = notes;

    // Set verifiedAt if company achieved verified status
    if (shouldSetVerifiedAt) {
      updatePayload.verifiedAt = nowTs;
      // Also set expiration if not already set
      if (!company.expiresAt) {
        const expiresAt = new Date(nowTs);
        expiresAt.setDate(
          expiresAt.getDate() + BUSINESS_RULES.CERTIFICATION_DURATION_DAYS
        );
        updatePayload.expiresAt = expiresAt;
      }
    }

    await this.db
      .update(peaceSealCompanies)
      .set(updatePayload)
      .where(eq(peaceSealCompanies.id, companyId));

    // Record status change in history with review notes
    const historyNote = notes
      ? `Manual review completed by advisor: ${notes}`
      : `Manual review completed by advisor - Score: ${manualScore}/100`;

    await this.db.insert(peaceSealStatusHistory).values({
      id: ulid(),
      companyId,
      status: newStatus,
      score: manualScore,
      notes: historyNote,
      changedByUserId: advisorUserId,
      createdAt: nowTs,
    });

    return {
      success: true,
      score: manualScore,
      status: newStatus,
      reviewedBy: advisorUserId,
    };
  }

  // Calculate score based on questionnaire responses (now private, used by advisors)
  private calculateScore(responses: any): number {
    if (!responses || typeof responses !== "object") {
      return 0;
    }

    // Parse if string
    const parsedResponses =
      typeof responses === "string" ? JSON.parse(responses) : responses;

    // New weight distribution matching the questionnaire config
    const sectionWeights = {
      ethicalPracticesGovernance: 0.3, // 30%
      peaceAlignedFinancialPractices: 0.25, // 25%
      employeeRightsWorkplaceCulture: 0.2, // 20%
      socialImpactCommunityEngagement: 0.15, // 15%
      globalPeaceCommitmentConflictAvoidance: 0.1, // 10%
      // Other sections contribute smaller amounts
      supplyChainEthics: 0.05,
      internalPeaceInclusionPolicies: 0.04,
      advocacyPublicPositioning: 0.03,
      conflictFreeOperations: 0.02,
      humanitarianContribution: 0.04,
      transparencyReporting: 0.02,
      environmentalResponsibility: 0.05,
      publicFeedbackExternalReporting: 0.02,
      environmentalPeacebuilding: 0.02, // Optional bonus
    };

    let totalScore = 0;

    // Section 2: Ethical Practices & Governance (30%)
    const ethicsScore = this.evaluateEthicsGovernanceSection(parsedResponses);
    totalScore += ethicsScore * sectionWeights.ethicalPracticesGovernance;

    // Section 3: Peace-Aligned Financial Practices (25%)
    const financeScore =
      this.evaluateFinancialPracticesSection(parsedResponses);
    totalScore += financeScore * sectionWeights.peaceAlignedFinancialPractices;

    // Section 10: Employee Rights & Workplace Culture (20%)
    const employeeScore = this.evaluateEmployeeRightsSection(parsedResponses);
    totalScore += employeeScore * sectionWeights.employeeRightsWorkplaceCulture;

    // Section 11: Social Impact & Community Engagement (15%)
    const socialScore = this.evaluateSocialImpactSection(parsedResponses);
    totalScore += socialScore * sectionWeights.socialImpactCommunityEngagement;

    // Section 13: Global Peace Commitment & Conflict Avoidance (10%)
    const peaceScore = this.evaluateGlobalPeaceSection(parsedResponses);
    totalScore +=
      peaceScore * sectionWeights.globalPeaceCommitmentConflictAvoidance;

    // Additional smaller sections
    totalScore +=
      this.evaluateSupplyChainSection(parsedResponses) *
      sectionWeights.supplyChainEthics;
    totalScore +=
      this.evaluateInternalPeaceSection(parsedResponses) *
      sectionWeights.internalPeaceInclusionPolicies;
    totalScore +=
      this.evaluateAdvocacySection(parsedResponses) *
      sectionWeights.advocacyPublicPositioning;
    totalScore +=
      this.evaluateConflictFreeSection(parsedResponses) *
      sectionWeights.conflictFreeOperations;
    totalScore +=
      this.evaluateHumanitarianSection(parsedResponses) *
      sectionWeights.humanitarianContribution;
    totalScore +=
      this.evaluateTransparencySection(parsedResponses) *
      sectionWeights.transparencyReporting;
    totalScore +=
      this.evaluateEnvironmentalSection(parsedResponses) *
      sectionWeights.environmentalResponsibility;
    totalScore +=
      this.evaluatePublicFeedbackSection(parsedResponses) *
      sectionWeights.publicFeedbackExternalReporting;

    // Optional bonus section
    if (parsedResponses.environmentalPeacebuilding) {
      totalScore +=
        this.evaluateEnvironmentalPeacebuildingSection(parsedResponses) *
        sectionWeights.environmentalPeacebuilding;
    }

    return Math.round(Math.max(0, Math.min(100, totalScore)));
  }

  // Section 2: Ethical Practices & Governance (30% weight)
  private evaluateEthicsGovernanceSection(responses: any): number {
    const section = responses.ethicalPracticesGovernance;
    if (!section) return 0;

    let score = 0;
    const maxScore = 100;

    // Governance structure description (25 points)
    if (this.hasSubstantialText(section.ownershipGovernanceStructure))
      score += 25;

    // Has ethics code (20 points, bonus for file upload)
    if (section.hasEthicsCode) {
      score += 15;
      if (section.ethicsCodeFile) score += 5; // bonus for documentation
    }

    // Supplier treatment (20 points)
    if (this.hasSubstantialText(section.supplierTreatmentDescription))
      score += 20;

    // Lobbying transparency (20 points)
    if (section.engagesInLobbying === false) {
      score += 20; // No lobbying is good
    } else if (
      section.engagesInLobbying === true &&
      (this.hasSubstantialText(section.lobbyingDetails) ||
        this.hasSubstantialText(section.politicalDonationsDetails))
    ) {
      score += 10; // Transparency in lobbying is better than none
    }

    // General transparency (15 points)
    if (
      this.hasSubstantialText(section.supplierTreatmentDescription) &&
      section.hasEthicsCode
    )
      score += 15;

    return Math.min(score, maxScore);
  }

  // Section 3: Peace-Aligned Financial Practices (25% weight)
  private evaluateFinancialPracticesSection(responses: any): number {
    const section = responses.peaceAlignedFinancialPractices;
    if (!section) return 0;

    let score = 0;
    const maxScore = 100;

    // No defense investments (critical - 40 points)
    if (section.hasDefenseInvestments === false) {
      score += 40;
    } else if (
      section.hasDefenseInvestments === true &&
      this.hasSubstantialText(section.defenseInvestmentDetails)
    ) {
      score += 10; // Partial credit for transparency
    }

    // ESG disclosures (30 points)
    if (section.publishesESGDisclosures) {
      score += 20;
      if (section.esgDisclosuresFile) score += 10; // bonus for providing files
    }

    // Audited financials (30 points)
    if (section.auditedFinancialsFile) score += 30;

    return Math.min(score, maxScore);
  }

  // Section 10: Employee Rights & Workplace Culture (20% weight)
  private evaluateEmployeeRightsSection(responses: any): number {
    const section = responses.employeeRightsWorkplaceCulture;
    if (!section) return 0;

    let score = 0;
    const maxScore = 100;

    // Wage standards and benefits (25 points)
    if (this.hasSubstantialText(section.wageStandardsBenefits)) score += 25;

    // DEI programs (25 points)
    if (section.deiProgramsFile || section.deiAuditResults) score += 25;

    // Whistleblower protections (25 points)
    if (this.hasSubstantialText(section.whistleblowerProtections)) score += 25;

    // Workplace culture (25 points)
    if (this.hasSubstantialText(section.workplaceCultureDescription))
      score += 25;

    return Math.min(score, maxScore);
  }

  // Section 11: Social Impact & Community Engagement (15% weight)
  private evaluateSocialImpactSection(responses: any): number {
    const section = responses.socialImpactCommunityEngagement;
    if (!section) return 0;

    let score = 0;
    const maxScore = 100;

    // Community partnerships (30 points)
    if (this.hasSubstantialText(section.communityPartnerships)) score += 30;

    // Volunteer programs (25 points)
    if (this.hasSubstantialText(section.volunteerPrograms)) score += 25;

    // Conflict-sensitive practices (25 points)
    if (this.hasSubstantialText(section.conflictSensitivePractices))
      score += 25;

    // Community feedback mechanisms (20 points)
    if (this.hasSubstantialText(section.communityFeedbackMechanisms))
      score += 20;

    return Math.min(score, maxScore);
  }

  // Section 13: Global Peace Commitment & Conflict Avoidance (10% weight)
  private evaluateGlobalPeaceSection(responses: any): number {
    const section = responses.globalPeaceCommitmentConflictAvoidance;
    if (!section) return 0;

    let score = 0;
    const maxScore = 100;

    // Oppressive regime policy (40 points)
    if (section.oppressiveRegimePolicy === true) {
      score += 30;
      if (section.oppressiveRegimePolicyFile) score += 10; // bonus for documentation
    }

    // Conflict resolution advocacy (30 points)
    if (this.hasSubstantialText(section.conflictResolutionAdvocacy))
      score += 30;

    // Peace talks support (30 points)
    if (this.hasSubstantialText(section.peaceTalksSupport)) score += 30;

    return Math.min(score, maxScore);
  }

  // Additional evaluation methods for other sections
  private evaluateSupplyChainSection(responses: any): number {
    const section = responses.supplyChainEthics;
    if (!section) return 0;

    let score = 0;
    if (section.hasSupplierCodeOfConduct) score += 30;
    if (this.hasSubstantialText(section.vendorDueDiligenceProcess)) score += 35;
    if (section.topSuppliersFile) score += 35;
    return Math.min(score, 100);
  }

  private evaluateInternalPeaceSection(responses: any): number {
    const section = responses.internalPeaceInclusionPolicies;
    if (!section) return 0;

    let score = 0;
    if (this.hasSubstantialText(section.deiPoliciesDescription)) score += 25;
    if (this.hasSubstantialText(section.conflictResolutionPrograms))
      score += 25;
    if (this.hasSubstantialText(section.mentalHealthPrograms)) score += 25;
    if (section.vulnerablePopulationsHiring) score += 25;
    return Math.min(score, 100);
  }

  private evaluateAdvocacySection(responses: any): number {
    const section = responses.advocacyPublicPositioning;
    if (!section) return 0;

    let score = 0;
    if (
      Array.isArray(section.peaceStatements) &&
      section.peaceStatements.length > 0
    )
      score += 40;
    if (this.hasSubstantialText(section.peacePlatformExamples)) score += 60;
    return Math.min(score, 100);
  }

  private evaluateConflictFreeSection(responses: any): number {
    const section = responses.conflictFreeOperations;
    if (!section) return 0;

    let score = 0;
    if (
      Array.isArray(section.operationCountries) &&
      section.operationCountries.length > 0
    )
      score += 25;
    if (this.hasSubstantialText(section.conflictZonePolicy)) score += 50;
    if (section.activeConflictZoneOperations === false) score += 25;
    return Math.min(score, 100);
  }

  private evaluateHumanitarianSection(responses: any): number {
    const section = responses.humanitarianContribution;
    if (!section) return 0;

    let score = 0;
    if (this.hasSubstantialText(section.peacebuildingDonations)) score += 30;
    if (this.hasSubstantialText(section.csrInitiativesDescription)) score += 30;
    if (this.hasSubstantialText(section.employeeVolunteerPrograms)) score += 40;
    return Math.min(score, 100);
  }

  private evaluateTransparencySection(responses: any): number {
    const section = responses.transparencyReporting;
    if (!section) return 0;

    let score = 0;
    if (section.annualReportsFile) score += 40;
    if (this.hasSubstantialText(section.grievanceSystem)) score += 30;
    if (this.hasSubstantialText(section.transparencyCommitment)) score += 30;
    return Math.min(score, 100);
  }

  private evaluateEnvironmentalSection(responses: any): number {
    const section = responses.environmentalResponsibility;
    if (!section) return 0;

    let score = 0;
    if (section.carbonFootprintFile) score += 25;
    if (section.sustainabilityCertificationsFile) score += 25;
    if (this.hasSubstantialText(section.renewableEnergyUsage)) score += 25;
    if (this.hasSubstantialText(section.climateCommitments)) score += 25;
    return Math.min(score, 100);
  }

  private evaluatePublicFeedbackSection(responses: any): number {
    const section = responses.publicFeedbackExternalReporting;
    if (!section) return 0;

    let score = 0;
    if (this.hasSubstantialText(section.publicComplaintsResponse)) score += 40;
    if (this.hasSubstantialText(section.reputationManagement)) score += 30;
    if (section.glassdoorLink || section.googleReviewsLink) score += 30;
    return Math.min(score, 100);
  }

  private evaluateEnvironmentalPeacebuildingSection(responses: any): number {
    const section = responses.environmentalPeacebuilding;
    if (!section || !section.sustainabilityPeaceLink) return 0;

    let score = 0;
    if (this.hasSubstantialText(section.waterAccessInitiatives)) score += 25;
    if (this.hasSubstantialText(section.indigenousProtection)) score += 25;
    if (this.hasSubstantialText(section.resourceConflictPrevention))
      score += 25;
    if (this.hasSubstantialText(section.environmentalJustice)) score += 25;
    return Math.min(score, 100);
  }

  // Helper method to check if text has substantial content
  private hasSubstantialText(text: string): boolean {
    return typeof text === "string" && text.trim().length >= 50; // At least 50 characters
  }

  // Determine status based on score with verification timestamp
  private getStatusFromScore(score: number): {
    status: PeaceSealStatus;
    shouldSetVerifiedAt: boolean;
  } {
    if (score >= SCORE_THRESHOLDS.PASS) {
      return {
        status: PEACE_SEAL_STATUS.VERIFIED,
        shouldSetVerifiedAt: true,
      };
    }
    if (score >= SCORE_THRESHOLDS.CONDITIONAL) {
      return {
        status: PEACE_SEAL_STATUS.CONDITIONAL,
        shouldSetVerifiedAt: false,
      };
    }
    return {
      status: PEACE_SEAL_STATUS.DID_NOT_PASS,
      shouldSetVerifiedAt: false,
    };
  }

  // Get user's applications
  async getMyApplications(userId: string) {
    const applications = await this.db
      .select({
        id: peaceSealCompanies.id,
        slug: peaceSealCompanies.slug,
        name: peaceSealCompanies.name,
        status: peaceSealCompanies.status,
        paymentStatus: peaceSealCompanies.paymentStatus,
        score: peaceSealCompanies.score,
        createdAt: peaceSealCompanies.createdAt,
        expiresAt: peaceSealCompanies.expiresAt,
      })
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.createdByUserId, userId))
      .orderBy(desc(peaceSealCompanies.createdAt));

    return { items: applications };
  }

  // Admin: List companies for management
  async adminListCompanies(filters: AdminFilters) {
    const {
      status,
      assignedToMe,
      userId,
      userRole,
      communityListed,
      page = 1,
      limit = 20,
    } = filters;
    const offset = (page - 1) * Math.min(limit, 100);

    // Permission check
    if (!["advisor", "admin", "superAdmin"].includes(userRole || "")) {
      throw new HTTPException(403, { message: "Insufficient permissions" });
    }

    const where: any[] = [];
    if (status) where.push(eq(peaceSealCompanies.status, status));
    if (assignedToMe && userRole === "advisor" && userId) {
      where.push(eq(peaceSealCompanies.advisorUserId, userId));
    }
    if (communityListed !== undefined) {
      where.push(
        eq(peaceSealCompanies.communityListed, communityListed ? 1 : 0)
      );
    }

    const items = await this.db
      .select({
        id: peaceSealCompanies.id,
        slug: peaceSealCompanies.slug,
        name: peaceSealCompanies.name,
        country: peaceSealCompanies.country,
        industry: peaceSealCompanies.industry,
        employeeCount: peaceSealCompanies.employeeCount,
        status: peaceSealCompanies.status,
        score: peaceSealCompanies.score,
        paymentStatus: peaceSealCompanies.paymentStatus,
        paymentAmountCents: peaceSealCompanies.paymentAmountCents,
        paymentDate: peaceSealCompanies.paymentDate,
        createdAt: peaceSealCompanies.createdAt,
        updatedAt: peaceSealCompanies.updatedAt,
        lastReviewedAt: peaceSealCompanies.lastReviewedAt,
        advisorUserId: peaceSealCompanies.advisorUserId,
        notes: peaceSealCompanies.notes, // Include notes for advisors
        expiresAt: peaceSealCompanies.expiresAt,
        communityListed: peaceSealCompanies.communityListed,
        employeeRatingAvg: peaceSealCompanies.employeeRatingAvg,
        employeeRatingCount: peaceSealCompanies.employeeRatingCount,
        overallRatingAvg: peaceSealCompanies.overallRatingAvg,
        overallRatingCount: peaceSealCompanies.overallRatingCount,
      })
      .from(peaceSealCompanies)
      .where(where.length ? (and as any)(...where) : undefined)
      .orderBy(desc(peaceSealCompanies.updatedAt))
      .limit(Math.min(limit, 100))
      .offset(offset);

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(peaceSealCompanies)
      .where(where.length ? (and as any)(...where) : undefined);

    const total = countResult[0]?.count || 0;

    return { items, page: page, limit: Math.min(limit, 100), total };
  }

  // Admin: Get company details for management
  async adminGetCompany(companyId: string, userRole: string) {
    // Permission check
    if (!["advisor", "admin", "superAdmin"].includes(userRole)) {
      throw new HTTPException(403, { message: "Insufficient permissions" });
    }

    const company = await this.db
      .select()
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.id, companyId))
      .then((r) => r[0]);

    if (!company) {
      throw new HTTPException(404, { message: "Company not found" });
    }

    // Get questionnaire if exists
    const questionnaire = await this.db
      .select()
      .from(peaceSealQuestionnaires)
      .where(eq(peaceSealQuestionnaires.companyId, companyId))
      .then((r) => r[0]);

    // Get status history
    const history = await this.db
      .select({
        id: peaceSealStatusHistory.id,
        status: peaceSealStatusHistory.status,
        score: peaceSealStatusHistory.score,
        notes: peaceSealStatusHistory.notes,
        createdAt: peaceSealStatusHistory.createdAt,
        changedByUserId: peaceSealStatusHistory.changedByUserId,
      })
      .from(peaceSealStatusHistory)
      .where(eq(peaceSealStatusHistory.companyId, companyId))
      .orderBy(desc(peaceSealStatusHistory.createdAt))
      .limit(10);

    // Get documents
    const documents = await this.db
      .select()
      .from(peaceSealDocuments)
      .where(eq(peaceSealDocuments.companyId, companyId))
      .orderBy(desc(peaceSealDocuments.createdAt));

    // Parse questionnaire responses if they exist
    let parsedQuestionnaire: any = null;
    if (questionnaire && questionnaire.responses) {
      const parsedSections = parseQuestionnaireResponses(
        questionnaire.responses
      );
      const stats = getQuestionnaireStats(parsedSections);

      parsedQuestionnaire = {
        id: questionnaire.id,
        progress: questionnaire.progress,
        completedAt: questionnaire.completedAt,
        createdAt: questionnaire.createdAt,
        updatedAt: questionnaire.updatedAt,
        sections: parsedSections,
        stats,
      };
    }

    return {
      company,
      questionnaire: parsedQuestionnaire,
      history,
      documents,
    };
  }

  // Admin: Update company details
  async adminUpdate(data: AdminUpdateDTO) {
    const { companyId, status, score, notes, advisorUserId, changedByUserId } =
      data;

    // Get current company state for validation
    const currentCompany = await this.db
      .select({
        status: peaceSealCompanies.status,
        score: peaceSealCompanies.score,
        verifiedAt: peaceSealCompanies.verifiedAt,
      })
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.id, companyId))
      .then((r) => r[0]);

    if (!currentCompany) {
      throw new HTTPException(404, { message: "Company not found" });
    }

    const nowTs = now();
    const payload: any = { updatedAt: nowTs };

    // Validate and handle status change
    if (status) {
      if (!isValidStatus(status)) {
        throw new HTTPException(400, { message: "Invalid status value" });
      }

      const currentStatus = currentCompany.status as PeaceSealStatus;
      if (!canTransitionStatus(currentStatus, status as PeaceSealStatus)) {
        throw new HTTPException(400, {
          message: `Invalid status transition from ${currentStatus} to ${status}`,
        });
      }

      payload.status = status;
      payload.lastReviewedAt = nowTs;

      // Special handling for verification status
      if (
        status === PEACE_SEAL_STATUS.VERIFIED &&
        currentCompany.status !== PEACE_SEAL_STATUS.VERIFIED
      ) {
        payload.verifiedAt = nowTs;
        // Set expiration date if not already set
        if (!currentCompany.verifiedAt) {
          const expiresAt = new Date(nowTs);
          expiresAt.setDate(
            expiresAt.getDate() + BUSINESS_RULES.CERTIFICATION_DURATION_DAYS
          );
          payload.expiresAt = expiresAt;
        }
      }
    }

    // Validate and handle score change
    if (typeof score === "number") {
      if (score < 0 || score > 100) {
        throw new HTTPException(400, {
          message: "Score must be between 0 and 100",
        });
      }
      payload.score = score;
      payload.lastReviewedAt = nowTs;

      // Auto-suggest status based on score if no explicit status provided
      if (!status) {
        const { status: suggestedStatus, shouldSetVerifiedAt } =
          this.getStatusFromScore(score);
        const currentStatus = currentCompany.status as PeaceSealStatus;

        // Only auto-transition if it's a valid transition and makes sense
        if (canTransitionStatus(currentStatus, suggestedStatus)) {
          payload.status = suggestedStatus;
          if (shouldSetVerifiedAt && !currentCompany.verifiedAt) {
            payload.verifiedAt = nowTs;
          }
        }
      }
    }

    if (typeof notes === "string") payload.notes = notes;
    if (advisorUserId) payload.advisorUserId = advisorUserId;

    await this.db
      .update(peaceSealCompanies)
      .set(payload)
      .where(eq(peaceSealCompanies.id, companyId));

    // Record in history
    const historyNotes =
      [
        notes && `Notes: ${notes}`,
        typeof score === "number" && `Score updated to ${score}`,
        advisorUserId && `Advisor assigned`,
        status && `Status changed to ${status}`,
      ]
        .filter(Boolean)
        .join("; ") || "Company updated by admin";

    await this.db.insert(peaceSealStatusHistory).values({
      id: ulid(),
      companyId,
      status: payload.status || currentCompany.status,
      score: typeof score === "number" ? score : currentCompany.score,
      notes: historyNotes,
      changedByUserId,
      createdAt: nowTs,
    });

    return { success: true };
  }

  // Submit public report
  async submitReport(data: CreateReportDTO) {
    const {
      companyId,
      reporterEmail,
      reporterName,
      reason,
      description,
      evidence,
    } = data;

    // Verify company exists
    const company = await this.db
      .select({ id: peaceSealCompanies.id, status: peaceSealCompanies.status })
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.id, companyId))
      .then((r) => r[0]);

    if (!company) {
      throw new HTTPException(404, { message: "Company not found" });
    }

    // Create report
    await this.db.insert(peaceSealReports).values({
      id: crypto.randomUUID(),
      companyId,
      reporterEmail,
      reporterName,
      reason,
      description,
      evidence,
      createdAt: now(),
    });

    // Change company status to under_review if currently certified
    if (company.status === "audit_completed") {
      await this.db
        .update(peaceSealCompanies)
        .set({
          status: "under_review",
          updatedAt: now(),
        })
        .where(eq(peaceSealCompanies.id, companyId));

      // Record status change
      await this.db.insert(peaceSealStatusHistory).values({
        id: ulid(),
        companyId,
        status: "under_review",
        notes: "Status changed to under review due to public report",
        changedByUserId: "system", // System change
        createdAt: now(),
      });
    }

    return { success: true };
  }

  // Get statistics for dashboard
  async getStatistics() {
    const stats = await this.db
      .select({
        status: peaceSealCompanies.status,
        count: sql<number>`count(*)`,
      })
      .from(peaceSealCompanies)
      .groupBy(peaceSealCompanies.status);

    const avgScore = await this.db
      .select({
        avg: sql<number>`avg(${peaceSealCompanies.score})`,
      })
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.status, "audit_completed"));

    // Companies expiring soon (30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSoon = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(peaceSealCompanies)
      .where(
        and(
          eq(peaceSealCompanies.status, "audit_completed"),
          sql`${peaceSealCompanies.expiresAt} < ${thirtyDaysFromNow}`
        )
      );

    return {
      byStatus: stats.reduce(
        (acc, item) => {
          acc[item.status] = item.count;
          return acc;
        },
        {} as Record<string, number>
      ),
      averageScore: avgScore[0]?.avg || 0,
      expiringSoon: expiringSoon[0]?.count || 0,
      totalCompanies: stats.reduce((sum, item) => sum + item.count, 0),
    };
  }

  // Check expiring certifications
  async checkExpiringCertifications() {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiring = await this.db
      .select()
      .from(peaceSealCompanies)
      .where(
        and(
          eq(peaceSealCompanies.status, "audit_completed"),
          sql`${peaceSealCompanies.expiresAt} < ${thirtyDaysFromNow}`,
          eq(peaceSealCompanies.renewalReminderSent, 0)
        )
      );

    return expiring;
  }

  // Mark renewal reminder as sent
  async markRenewalReminderSent(companyId: string) {
    await this.db
      .update(peaceSealCompanies)
      .set({ renewalReminderSent: 1 })
      .where(eq(peaceSealCompanies.id, companyId));
  }

  // Validate questionnaire completeness
  validateQuestionnaire(responses: any): {
    isValid: boolean;
    missingFields: string[];
    completionPercentage: number;
  } {
    if (!responses || typeof responses !== "object") {
      return {
        isValid: false,
        missingFields: ["responses"],
        completionPercentage: 0,
      };
    }

    const parsedResponses =
      typeof responses === "string" ? JSON.parse(responses) : responses;

    const requiredFields = [
      "companyInfo.name",
      "companyInfo.website",
      "ethicalPractices.governanceStructure",
      "ethicalPractices.ethicsCode",
      "peaceAlignedFinances.militaryInvestments",
      "supplyChain.conductCode",
      "employeeRights.deiPolicies",
      "socialImpact.communityPartnerships",
      "environmentalResponsibility.carbonReporting",
      "peaceCommitment.conflictAvoidance",
    ];

    const missingFields: string[] = [];
    let completedFields = 0;

    for (const field of requiredFields) {
      const value = this.getNestedValue(parsedResponses, field);
      if (!value) {
        missingFields.push(field);
      } else {
        completedFields++;
      }
    }

    const completionPercentage = Math.round(
      (completedFields / requiredFields.length) * 100
    );

    return {
      isValid: missingFields.length === 0,
      missingFields,
      completionPercentage,
    };
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }
}
