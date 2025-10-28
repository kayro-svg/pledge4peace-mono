import { HTTPException } from "hono/http-exception";
import { createDb } from "../db";
import { Context } from "hono";
import { PeaceSealRenewalService } from "../services/peace-seal-renewal.service";
import { logger } from "../utils/logger";

export class PeaceSealRenewalController {
  // Create renewal record
  createRenewal = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const renewalService = new PeaceSealRenewalService(db);
      const user = c.get("user");

      // Check if user is admin or advisor
      if (!["admin", "superAdmin", "advisor"].includes(user.role)) {
        throw new HTTPException(403, {
          message: "Only admins and advisors can create renewals",
        });
      }

      const {
        companyId,
        renewalYear,
        amountCents,
        paymentTransactionId,
        paymentDate,
      } = await c.req.json().catch(() => ({}));

      if (!companyId || !renewalYear || !amountCents) {
        throw new HTTPException(400, {
          message: "companyId, renewalYear, and amountCents are required",
        });
      }

      const renewal = await renewalService.createRenewal({
        companyId,
        renewalYear,
        amountCents,
        paymentTransactionId,
        paymentDate,
      });

      return c.json({ renewal });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error creating renewal:", error);
      throw new HTTPException(500, { message: "Error creating renewal" });
    }
  };

  // Get company renewals
  getCompanyRenewals = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const renewalService = new PeaceSealRenewalService(db);
      const user = c.get("user");

      const companyId = c.req.param("companyId");

      // Check if user is admin, advisor, or company owner
      if (!["admin", "superAdmin", "advisor"].includes(user.role)) {
        if (user.role !== "user" || user.companyId !== companyId) {
          throw new HTTPException(403, { message: "Access denied" });
        }
      }

      const renewals = await renewalService.getCompanyRenewals(companyId);
      return c.json({ renewals });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching company renewals:", error);
      throw new HTTPException(500, {
        message: "Error fetching company renewals",
      });
    }
  };

  // Get company rewards
  getCompanyRewards = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const renewalService = new PeaceSealRenewalService(db);
      const user = c.get("user");

      const companyId = c.req.param("companyId");

      // Check if user is admin, advisor, or company owner
      if (!["admin", "superAdmin", "advisor"].includes(user.role)) {
        if (user.role !== "user" || user.companyId !== companyId) {
          throw new HTTPException(403, { message: "Access denied" });
        }
      }

      const rewards = await renewalService.getCompanyRewards(companyId);
      return c.json({ rewards });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching company rewards:", error);
      throw new HTTPException(500, {
        message: "Error fetching company rewards",
      });
    }
  };

  // Get Peace Seal Center resources
  getPeaceSealCenterResources = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const renewalService = new PeaceSealRenewalService(db);
      const user = c.get("user");

      // Get resources - all authenticated users can view resources
      // The resource's `isPublic` and `accessLevel` fields control visibility
      const resources =
        await renewalService.getPeaceSealCenterResources("certified");
      return c.json({ resources });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching Peace Seal Center resources:", error);
      throw new HTTPException(500, {
        message: "Error fetching Peace Seal Center resources",
      });
    }
  };

  // Add Peace Seal Center resource (admin only)
  addPeaceSealCenterResource = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const renewalService = new PeaceSealRenewalService(db);
      const user = c.get("user");

      // Check if user exists
      if (!user) {
        throw new HTTPException(401, {
          message: "Authentication required",
        });
      }

      // Check if user is admin or superAdmin
      if (!["admin", "superAdmin"].includes(user.role)) {
        throw new HTTPException(403, {
          message: "Only admins can add Peace Seal Center resources",
        });
      }

      const {
        title,
        description,
        resourceType,
        fileUrl,
        category,
        isPublic,
        accessLevel,
      } = await c.req.json().catch(() => ({}));

      if (!title || !resourceType || !category) {
        throw new HTTPException(400, {
          message: "title, resourceType, and category are required",
        });
      }

      const resource = await renewalService.addPeaceSealCenterResource({
        title,
        description,
        resourceType,
        fileUrl,
        category,
        isPublic,
        accessLevel,
      });

      return c.json({ resource });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error adding Peace Seal Center resource:", error);
      throw new HTTPException(500, {
        message: "Error adding Peace Seal Center resource",
      });
    }
  };

  // Process renewal payment
  processRenewalPayment = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const renewalService = new PeaceSealRenewalService(db);
      const user = c.get("user");

      // Check if user is admin, advisor, or company owner
      if (!["admin", "superAdmin", "advisor"].includes(user.role)) {
        if (user.role !== "user" || !user.companyId) {
          throw new HTTPException(403, { message: "Access denied" });
        }
      }

      const { companyId, renewalYear, paymentTransactionId, paymentDate } =
        await c.req.json().catch(() => ({}));

      if (!companyId || !renewalYear || !paymentTransactionId) {
        throw new HTTPException(400, {
          message:
            "companyId, renewalYear, and paymentTransactionId are required",
        });
      }

      const result = await renewalService.processRenewalPayment(
        companyId,
        renewalYear,
        paymentTransactionId,
        paymentDate || Date.now()
      );

      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error processing renewal payment:", error);
      throw new HTTPException(500, {
        message: "Error processing renewal payment",
      });
    }
  };

  // Update badge level
  updateBadgeLevel = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const renewalService = new PeaceSealRenewalService(db);
      const user = c.get("user");

      // Check if user is admin or advisor
      if (!["admin", "superAdmin", "advisor"].includes(user.role)) {
        throw new HTTPException(403, {
          message: "Only admins and advisors can update badge levels",
        });
      }

      const companyId = c.req.param("companyId");
      const { score } = await c.req.json().catch(() => ({}));

      if (!companyId || score === undefined) {
        throw new HTTPException(400, {
          message: "companyId and score are required",
        });
      }

      const result = await renewalService.updateBadgeLevel(companyId, score);
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error updating badge level:", error);
      throw new HTTPException(500, { message: "Error updating badge level" });
    }
  };

  // Request physical badge
  requestPhysicalBadge = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const renewalService = new PeaceSealRenewalService(db);
      const user = c.get("user");

      // Check if user is company owner
      if (user.role !== "user" || !user.companyId) {
        throw new HTTPException(403, {
          message: "Only company users can request physical badges",
        });
      }

      const companyId = c.req.param("companyId");

      // Verify user owns this company
      if (user.companyId !== companyId) {
        throw new HTTPException(403, { message: "Access denied" });
      }

      const result = await renewalService.requestPhysicalBadge(companyId);
      return c.json(result);
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error requesting physical badge:", error);
      throw new HTTPException(500, {
        message: "Error requesting physical badge",
      });
    }
  };

  // Get expiring renewals (admin only)
  getExpiringRenewals = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const renewalService = new PeaceSealRenewalService(db);
      const user = c.get("user");

      // Check if user is admin or superAdmin
      if (!["admin", "superAdmin"].includes(user.role)) {
        throw new HTTPException(403, {
          message: "Only admins can view expiring renewals",
        });
      }

      const url = new URL(c.req.url);
      const daysAhead = parseInt(url.searchParams.get("daysAhead") || "30");

      const expiringRenewals =
        await renewalService.getExpiringRenewals(daysAhead);
      return c.json({ expiringRenewals });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error fetching expiring renewals:", error);
      throw new HTTPException(500, {
        message: "Error fetching expiring renewals",
      });
    }
  };

  // Generate digital badge
  generateDigitalBadge = async (c: Context) => {
    try {
      const db = createDb(c.env.DB);
      const renewalService = new PeaceSealRenewalService(db);
      const user = c.get("user");

      const companyId = c.req.param("companyId");

      // Check if user is admin, advisor, or company owner
      if (!["admin", "superAdmin", "advisor"].includes(user.role)) {
        if (user.role !== "user" || user.companyId !== companyId) {
          throw new HTTPException(403, { message: "Access denied" });
        }
      }

      // Get company details
      const company = await db
        .select({
          id: peaceSealCompanies.id,
          name: peaceSealCompanies.name,
          badgeLevel: peaceSealCompanies.badgeLevel,
          score: peaceSealCompanies.score,
          status: peaceSealCompanies.status,
        })
        .from(peaceSealCompanies)
        .where(eq(peaceSealCompanies.id, companyId))
        .then((r) => r[0]);

      if (!company) {
        throw new HTTPException(404, { message: "Company not found" });
      }

      // Generate badge URL (this would typically generate an actual badge image)
      const badgeUrl = `/api/peace-seal/badges/${companyId}/digital`;

      // Update company with digital badge URL if not already set
      if (!company.digitalBadgeUrl) {
        await db
          .update(peaceSealCompanies)
          .set({
            digitalBadgeUrl: badgeUrl,
            updatedAt: Date.now(),
          })
          .where(eq(peaceSealCompanies.id, companyId));
      }

      return c.json({
        badgeUrl,
        company: {
          name: company.name,
          badgeLevel: company.badgeLevel,
          score: company.score,
          status: company.status,
        },
      });
    } catch (error) {
      if (error instanceof HTTPException) throw error;
      logger.error("Error generating digital badge:", error);
      throw new HTTPException(500, {
        message: "Error generating digital badge",
      });
    }
  };
}
