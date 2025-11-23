import { eq, and, desc, sql } from "drizzle-orm";
import { peaceSealReports, peaceSealCompanies } from "../db/schema/peace-seal";
import { users } from "../db/schema/users";
import type { DbClient } from "../types";
import { HTTPException } from "hono/http-exception";
import {
  REPORT_REASONS,
  REPORT_STATUS,
  BUSINESS_RULES,
  PEACE_SEAL_STATUS,
  isValidReportReason,
  isValidReportStatus,
  type ReportReason,
  type ReportStatus,
} from "../types/peace-seal";

export interface CreateReportDTO {
  companyId: string;
  reporterEmail?: string;
  reporterName?: string;
  reason: string;
  description?: string;
  evidence?: string;
}

export interface ReportFilters {
  companyId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ResolveReportDTO {
  reportId: string;
  resolution: "resolved" | "dismissed";
  resolutionNotes?: string;
  resolvedByUserId: string;
}

// Use centralized constants
const ALLOWED_REPORT_REASONS = Object.values(REPORT_REASONS);
const ALLOWED_REPORT_STATUS = Object.values(REPORT_STATUS);

function now() {
  return Date.now(); // Return timestamp for D1 compatibility
}

export class ReportsService {
  constructor(private db: DbClient) {}

  // Create public report
  async createReport(data: CreateReportDTO) {
    const {
      companyId,
      reporterEmail,
      reporterName,
      reason,
      description,
      evidence,
    } = data;

    // Validate reason
    if (!isValidReportReason(reason)) {
      throw new HTTPException(400, {
        message: `Invalid report reason. Allowed reasons: ${ALLOWED_REPORT_REASONS.join(", ")}`,
      });
    }

    // Verify company exists
    const company = await this.db
      .select({
        id: peaceSealCompanies.id,
        status: peaceSealCompanies.status,
        name: peaceSealCompanies.name,
      })
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.id, companyId))
      .then((r) => r[0]);

    if (!company) {
      throw new HTTPException(404, { message: "Company not found" });
    }

    // Check if company can be reported (only certified companies should be reported)
    if (
      ![PEACE_SEAL_STATUS.VERIFIED, PEACE_SEAL_STATUS.CONDITIONAL].includes(
        company.status as any
      )
    ) {
      throw new HTTPException(400, {
        message: "Reports can only be submitted for certified companies",
      });
    }

    // Check for duplicate reports from the same email/company combination
    if (reporterEmail) {
      const recentReport = await this.db
        .select({ id: peaceSealReports.id })
        .from(peaceSealReports)
        .where(
          and(
            eq(peaceSealReports.companyId, companyId),
            eq(peaceSealReports.reporterEmail, reporterEmail),
            sql`${peaceSealReports.createdAt} > datetime('now', '-${BUSINESS_RULES.REPORT_SPAM_WINDOW_DAYS} days')`
          )
        )
        .then((r) => r[0]);

      if (recentReport) {
        throw new HTTPException(429, {
          message: `You have already submitted a report for this company recently. Please wait ${BUSINESS_RULES.REPORT_SPAM_WINDOW_DAYS} days between reports.`,
        });
      }
    }

    // Create report
    const report = await this.db
      .insert(peaceSealReports)
      .values({
        id: crypto.randomUUID(),
        companyId,
        reporterEmail,
        reporterName,
        reason,
        description,
        evidence,
        status: "pending",
        createdAt: now(),
      })
      .returning();

    // If this is a critical report, immediately change company status to under_review
    const criticalReasons = [
      REPORT_REASONS.FALSE_PEACE_CLAIMS,
      REPORT_REASONS.MILITARY_INVESTMENTS,
      REPORT_REASONS.HUMAN_RIGHTS_VIOLATIONS,
    ] as const;
    if (
      criticalReasons.includes(reason as any) &&
      company.status === PEACE_SEAL_STATUS.VERIFIED
    ) {
      await this.updateCompanyStatusForReport(
        companyId,
        PEACE_SEAL_STATUS.UNDER_REVIEW
      );
    }

    return report[0];
  }

  // Get reports with filters
  async getReports(filters: ReportFilters, userRole?: string) {
    const { companyId, status, page = 1, limit = 20 } = filters;
    const offset = (page - 1) * Math.min(limit, 100);

    // Permission check for non-public access
    if (!["admin", "superAdmin", "advisor"].includes(userRole || "")) {
      throw new HTTPException(403, {
        message: "Insufficient permissions to view reports",
      });
    }

    const where: any[] = [];
    if (companyId) where.push(eq(peaceSealReports.companyId, companyId));
    if (status && isValidReportStatus(status)) {
      where.push(eq(peaceSealReports.status, status));
    }

    const reports = await this.db
      .select({
        id: peaceSealReports.id,
        companyId: peaceSealReports.companyId,
        companyName: peaceSealCompanies.name,
        reporterEmail: peaceSealReports.reporterEmail,
        reporterName: peaceSealReports.reporterName,
        reason: peaceSealReports.reason,
        description: peaceSealReports.description,
        evidence: peaceSealReports.evidence,
        status: peaceSealReports.status,
        resolutionNotes: peaceSealReports.resolutionNotes,
        createdAt: peaceSealReports.createdAt,
        resolvedAt: peaceSealReports.resolvedAt,
        resolvedByUserId: peaceSealReports.resolvedByUserId,
        resolverName: users.name,
      })
      .from(peaceSealReports)
      .leftJoin(
        peaceSealCompanies,
        eq(peaceSealReports.companyId, peaceSealCompanies.id)
      )
      .leftJoin(users, eq(peaceSealReports.resolvedByUserId, users.id))
      .where(where.length ? (and as any)(...where) : undefined)
      .orderBy(desc(peaceSealReports.createdAt))
      .limit(Math.min(limit, 100))
      .offset(offset);

    // Get total count
    const countResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(peaceSealReports)
      .where(where.length ? (and as any)(...where) : undefined);

    const total = countResult[0]?.count || 0;

    return {
      items: reports,
      page,
      limit: Math.min(limit, 100),
      total,
    };
  }

  // Resolve report
  async resolveReport(data: ResolveReportDTO) {
    const { reportId, resolution, resolutionNotes, resolvedByUserId } = data;

    // Validate resolution status
    if (!["resolved", "dismissed"].includes(resolution)) {
      throw new HTTPException(400, { message: "Invalid resolution status" });
    }

    // Get report details
    const report = await this.db
      .select({
        id: peaceSealReports.id,
        companyId: peaceSealReports.companyId,
        status: peaceSealReports.status,
        reason: peaceSealReports.reason,
      })
      .from(peaceSealReports)
      .where(eq(peaceSealReports.id, reportId))
      .then((r) => r[0]);

    if (!report) {
      throw new HTTPException(404, { message: "Report not found" });
    }

    if (["resolved", "dismissed"].includes(report.status)) {
      throw new HTTPException(400, {
        message: "Report has already been resolved",
      });
    }

    // Update report status
    await this.db
      .update(peaceSealReports)
      .set({
        status: resolution,
        resolutionNotes,
        resolvedByUserId,
        resolvedAt: now(),
      })
      .where(eq(peaceSealReports.id, reportId));

    // If resolved favorably, check if we should restore company status
    if (resolution === "dismissed") {
      await this.checkAndRestoreCompanyStatus(report.companyId);
    } else if (resolution === "resolved") {
      // If resolved against the company, consider suspending or downgrading
      await this.handleNegativeResolution(report.companyId, report.reason);
    }

    return { success: true };
  }

  // Get report by ID
  async getReportById(reportId: string, userRole?: string) {
    // Permission check
    if (!["admin", "superAdmin", "advisor"].includes(userRole || "")) {
      throw new HTTPException(403, { message: "Insufficient permissions" });
    }

    const report = await this.db
      .select({
        id: peaceSealReports.id,
        companyId: peaceSealReports.companyId,
        companyName: peaceSealCompanies.name,
        reporterEmail: peaceSealReports.reporterEmail,
        reporterName: peaceSealReports.reporterName,
        reason: peaceSealReports.reason,
        description: peaceSealReports.description,
        evidence: peaceSealReports.evidence,
        status: peaceSealReports.status,
        resolutionNotes: peaceSealReports.resolutionNotes,
        createdAt: peaceSealReports.createdAt,
        resolvedAt: peaceSealReports.resolvedAt,
        resolvedByUserId: peaceSealReports.resolvedByUserId,
        resolverName: users.name,
      })
      .from(peaceSealReports)
      .leftJoin(
        peaceSealCompanies,
        eq(peaceSealReports.companyId, peaceSealCompanies.id)
      )
      .leftJoin(users, eq(peaceSealReports.resolvedByUserId, users.id))
      .where(eq(peaceSealReports.id, reportId))
      .then((r) => r[0]);

    if (!report) {
      throw new HTTPException(404, { message: "Report not found" });
    }

    return report;
  }

  // Get report statistics
  async getReportStatistics() {
    const stats = await this.db
      .select({
        status: peaceSealReports.status,
        count: sql<number>`count(*)`,
      })
      .from(peaceSealReports)
      .groupBy(peaceSealReports.status);

    const reasonStats = await this.db
      .select({
        reason: peaceSealReports.reason,
        count: sql<number>`count(*)`,
      })
      .from(peaceSealReports)
      .groupBy(peaceSealReports.reason)
      .orderBy(desc(sql`count(*)`));

    // Recent reports (last 30 days)
    const recentReports = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(peaceSealReports)
      .where(sql`${peaceSealReports.createdAt} > datetime('now', '-30 days')`);

    return {
      byStatus: stats.reduce(
        (acc, item) => {
          acc[item.status] = item.count;
          return acc;
        },
        {} as Record<string, number>
      ),
      byReason: reasonStats.reduce(
        (acc, item) => {
          acc[item.reason] = item.count;
          return acc;
        },
        {} as Record<string, number>
      ),
      recentCount: recentReports[0]?.count || 0,
      totalReports: stats.reduce((sum, item) => sum + item.count, 0),
    };
  }

  // Private: Update company status when reported
  private async updateCompanyStatusForReport(
    companyId: string,
    newStatus: string
  ) {
    await this.db
      .update(peaceSealCompanies)
      .set({
        status: newStatus,
        updatedAt: now(),
      })
      .where(eq(peaceSealCompanies.id, companyId));
  }

  // Private: Check if company should be restored after dismissed reports
  private async checkAndRestoreCompanyStatus(companyId: string) {
    // Get company current status
    const company = await this.db
      .select({
        status: peaceSealCompanies.status,
        score: peaceSealCompanies.score,
      })
      .from(peaceSealCompanies)
      .where(eq(peaceSealCompanies.id, companyId))
      .then((r) => r[0]);

    if (!company) return;

    // Check if there are any pending or unresolved reports
    const pendingReports = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(peaceSealReports)
      .where(
        and(
          eq(peaceSealReports.companyId, companyId),
          sql`${peaceSealReports.status} IN ('pending', 'reviewing')`
        )
      );

    // If no pending reports and currently under review, restore based on score
    if (
      pendingReports[0]?.count === 0 &&
      company.status === PEACE_SEAL_STATUS.UNDER_REVIEW
    ) {
      const newStatus =
        company.score && company.score >= 75
          ? PEACE_SEAL_STATUS.VERIFIED
          : company.score && company.score >= 60
            ? PEACE_SEAL_STATUS.CONDITIONAL
            : PEACE_SEAL_STATUS.DID_NOT_PASS;

      await this.updateCompanyStatusForReport(companyId, newStatus);
    }
  }

  // Private: Handle negative resolution (company at fault)
  private async handleNegativeResolution(companyId: string, reason: string) {
    const criticalReasons = [
      REPORT_REASONS.FALSE_PEACE_CLAIMS,
      REPORT_REASONS.MILITARY_INVESTMENTS,
      REPORT_REASONS.HUMAN_RIGHTS_VIOLATIONS,
    ] as const;

    if (criticalReasons.includes(reason as any)) {
      // Suspend certification for critical violations
      await this.updateCompanyStatusForReport(
        companyId,
        PEACE_SEAL_STATUS.DID_NOT_PASS
      );
    } else {
      // Minor violations might just keep under review or downgrade to conditional
      await this.updateCompanyStatusForReport(
        companyId,
        PEACE_SEAL_STATUS.CONDITIONAL
      );
    }
  }

  // Get available report reasons and their descriptions
  getReportReasons() {
    return {
      false_peace_claims: "Company makes false claims about peace commitments",
      military_investments:
        "Company has investments in military or defense contractors",
      labor_violations: "Poor working conditions or labor violations",
      environmental_violations:
        "Environmental damage or lack of sustainability",
      ethical_violations: "Unethical business practices",
      misleading_information: "Misleading or false information provided",
      conflict_involvement: "Involvement in or support of conflicts",
      human_rights_violations: "Human rights violations",
      other: "Other concerns not listed above",
    };
  }
}
