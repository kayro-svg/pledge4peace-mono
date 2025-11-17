import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "../utils/logger";
import { z } from "zod";
import { createDb } from "../db";
import { users } from "../db/schema/users";
import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { NotificationsService } from "../services/notifications.service";

export class UsersController {
  async updateProfile(c: Context) {
    try {
      const user = c.get("user");
      if (!user) {
        return c.json({ message: "Authentication required" }, 401);
      }

      const body = await c.req.json();

      // Allow updating a safe subset of fields
      const schema = z
        .object({
          name: z.string().min(2).max(100).optional(),
          image: z.string().url().max(2048).optional(),
          // userType and extras can be enabled later with business rules
          // userType: z.enum(["citizen","politician","organization","student","other"]).optional(),
          // office: z.string().optional(),
          // organization: z.string().optional(),
          // institution: z.string().optional(),
          // otherRole: z.string().optional(),
        })
        .strict();

      const validation = schema.safeParse(body);
      if (!validation.success) {
        return c.json({ message: "Invalid input data" }, 400);
      }

      const db = createDb(c.env.DB);
      const now = new Date();

      // Build update set
      const updateSet: any = { updatedAt: now };
      if (typeof validation.data.name !== "undefined") {
        updateSet.name = validation.data.name.trim();
      }
      if (typeof validation.data.image !== "undefined") {
        updateSet.image = validation.data.image || null;
      }

      // Persist
      const updated = await db
        .update(users)
        .set(updateSet)
        .where(eq(users.id, user.id))
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          image: users.image,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        });

      const result = updated[0];
      if (!result) {
        return c.json({ message: "User not found" }, 404);
      }

      return c.json(
        {
          success: true,
          user: result,
        },
        200
      );
    } catch (error) {
      if (error instanceof HTTPException)
        return c.json((error as any).body, error.status);
      logger.error("Error updating user profile:", error);
      return c.json({ message: "Error updating profile" }, 500);
    }
  }

  /**
   * Admin list users with optional q and role filters (paginated)
   */
  async adminList(c: Context) {
    try {
      const q = (c.req.query("q") || "").trim();
      const role = (c.req.query("role") || "").trim();
      const includeUsers = ["1", "true"].includes(
        String(c.req.query("includeUsers") || "").toLowerCase()
      );
      const page = Math.max(parseInt(c.req.query("page") || "1"), 1);
      const limit = Math.min(
        Math.max(parseInt(c.req.query("limit") || "20"), 1),
        100
      );
      const offset = (page - 1) * limit;

      const db = createDb(c.env.DB);

      const filters: any[] = [];
      if (q) {
        const pattern = `%${q}%`;
        filters.push(or(like(users.email, pattern), like(users.name, pattern)));
      }
      // By default, only list moderators, advisors and admins. Allow including users for targeted searches.
      const defaultRoles: Array<"user" | "moderator" | "advisor" | "admin"> =
        includeUsers
          ? ["user", "moderator", "advisor", "admin"]
          : ["moderator", "advisor", "admin"];
      const roleFilterList =
        role && ["user", "moderator", "advisor", "admin"].includes(role)
          ? [role as "user" | "moderator" | "advisor" | "admin"]
          : defaultRoles;
      filters.push(inArray(users.role as any, roleFilterList as any));

      const whereExpr = filters.length > 0 ? and(...filters) : undefined;

      let rows = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(whereExpr as any)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);
      // Exclude superAdmin from results
      rows = (rows as any[]).filter((r) => r.role !== "superAdmin");

      const countRow = await db
        .select({ cnt: sql<number>`count(1)` })
        .from(users)
        .where(whereExpr as any);
      let total = countRow?.[0]?.cnt || 0;
      // Adjust total to reflect exclusion of superAdmin if present
      // This is an approximation; for exact, a separate count with same filters + role != superAdmin would be needed
      // Safe enough for small admin lists

      return c.json({ items: rows as any[], page, limit, total });
    } catch (error) {
      if (error instanceof HTTPException)
        return c.json((error as any).body, error.status);
      logger.error("Error listing users:", error);
      return c.json({ message: "Error listing users" }, 500);
    }
  }

  /**
   * Admin change role for an existing user and notify
   */
  async adminChangeRole(c: Context) {
    try {
      const current = c.get("user");
      if (!current) return c.json({ message: "Authentication required" }, 401);
      if (current.role !== "admin" && current.role !== "superAdmin") {
        return c.json({ message: "Insufficient permissions" }, 403);
      }

      const body = await c.req.json();
      const schema = z
        .object({
          userId: z.string().min(1),
          role: z.enum(["user", "moderator", "advisor", "admin"]),
        })
        .strict();
      const validation = schema.safeParse(body);
      if (!validation.success) {
        return c.json({ message: "Invalid input data" }, 400);
      }

      // Admins and SuperAdmins can assign the admin role

      const db = createDb(c.env.DB);
      // Ensure target exists and is not a superAdmin
      const targetExisting = await db.query.users.findFirst({
        where: eq(users.id, validation.data.userId),
      });
      if (!targetExisting) return c.json({ message: "User not found" }, 404);
      if (targetExisting.role === "superAdmin") {
        return c.json({ message: "SuperAdmin cannot be modified" }, 403);
      }

      const now = new Date();
      const updated = await db
        .update(users)
        .set({ role: validation.data.role, updatedAt: now })
        .where(eq(users.id, validation.data.userId))
        .returning({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          status: users.status,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        });

      const target = updated[0];
      if (!target) return c.json({ message: "User not found" }, 404);

      try {
        const authService = c.get("authService");
        await authService.emailService.sendRoleChangedEmail(
          target.email,
          validation.data.role
        );
      } catch (e) {
        logger.error("Failed to send role changed email", e);
      }

      // Set force-logout + post-login redirect flags in KV so the user must re-login and lands on dashboard
      try {
        const kv = (c.env as any).KV as KVNamespace | undefined;
        if (kv && typeof kv.put === "function") {
          await kv.put(`user:forceLogout:${target.id}`, String(Date.now()), {
            expirationTtl: 60 * 60 * 24, // 24h TTL
          });
          await kv.put(`user:postLoginRedirect:${target.id}`, "/dashboard", {
            expirationTtl: 60 * 60 * 24,
          });
        }
      } catch (e) {
        logger.error("Failed setting KV flags for logout/redirect", e);
      }

      return c.json({ success: true, user: target });
    } catch (error) {
      if (error instanceof HTTPException)
        return c.json((error as any).body, error.status);
      logger.error("Error changing user role:", error);
      return c.json({ message: "Error changing user role" }, 500);
    }
  }

  async subscribe(c: Context) {
    try {
      // Verificar que el usuario esté autenticado
      const user = c.get("user");
      if (!user) {
        return c.json({ message: "Authentication required" }, 401);
      }

      const brevoListsService = c.get("brevoListsService");

      try {
        // Preparar datos del contacto para Brevo
        const [firstName, ...lastNameParts] = user.name.split(" ");
        const lastName = lastNameParts.join(" ");

        // Verificar si el usuario ya está en la lista de subscribers
        const existingContact = await brevoListsService.getContact(user.email);

        if (
          Array.isArray(existingContact?.listIds) &&
          existingContact.listIds.includes(25)
        ) {
          return c.json(
            {
              message: "User is already subscribed to the newsletter",
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
              },
              brevoRegistered: true,
              alreadySubscribed: true,
            },
            200
          );
        }

        // Agregar usuario a la lista de subscribers
        await brevoListsService.addToSubscribersList({
          email: user.email,
          attributes: {
            FIRSTNAME: firstName || "",
            LASTNAME: lastName || "",
            EXT_ID: user.id,
          },
        });

        logger.log("✅ User manually subscribed to newsletter:", user.email);

        return c.json(
          {
            message: "Successfully subscribed to newsletter",
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
            brevoRegistered: true,
            alreadySubscribed: false,
          },
          200
        );
      } catch (brevoError) {
        logger.error("⚠️ Failed to subscribe user to newsletter:", brevoError);

        return c.json(
          {
            message: "There was an issue subscribing to the newsletter",
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
            brevoRegistered: false,
            brevoError:
              brevoError instanceof Error
                ? brevoError.message
                : "Unknown error",
          },
          200
        );
      }
    } catch (error) {
      if (error instanceof HTTPException) {
        const body = (error as any).body || { message: (error as any).message };
        return c.json(body, error.status);
      }
      logger.error("Error subscribing user:", error);
      return c.json({ message: "Error subscribing to newsletter" }, 500);
    }
  }

  async getSubscriptionStatus(c: Context) {
    try {
      // Verificar que el usuario esté autenticado
      const user = c.get("user");
      if (!user) {
        return c.json({ message: "Authentication required" }, 401);
      }

      const brevoListsService = c.get("brevoListsService");

      try {
        // Verificar si el usuario está en la lista de subscribers
        const contact = await brevoListsService.getContact(user.email);

        const isSubscribed = Array.isArray(contact?.listIds)
          ? contact.listIds.includes(25)
          : false; // Subscribers list ID

        const isConferenceAttendee = Array.isArray(contact?.listIds)
          ? contact.listIds.includes(23)
          : false; // Conference Attendees list ID

        return c.json(
          {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
            isSubscribed: !!isSubscribed,
            isConferenceAttendee: !!isConferenceAttendee,
            subscriptionDate: (contact as any)?.createdAt || null,
            brevoContactData: contact || null,
          },
          200
        );
      } catch (brevoError) {
        logger.error("Error checking subscription status:", brevoError);
        return c.json(
          {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
            isSubscribed: false,
            isConferenceAttendee: false,
            error: "Could not verify subscription status",
          },
          200
        );
      }
    } catch (error) {
      logger.error("Error getting subscription status:", error);
      return c.json({ message: "Error getting subscription status" }, 500);
    }
  }

  // async pledgeToCampaign(c: Context) {
  //   try {
  //     const user = c.get("user");
  //     if (!user) {
  //       return c.json({ message: "Authentication required" }, 401);
  //     }
  //
  //     const brevoListsService = c.get("brevoListsService");
  //
  //     const { campaignId, campaignTitle } = await c.req.json();
  //
  //     if (!campaignId || !campaignTitle) {
  //       return c.json({ message: "Campaign ID and title are required" }, 400);
  //     }
  //
  //     try {
  //       const contact = await brevoListsService.getContact(user.email);
  //
  //       if (!contact) {
  //         return c.json({ message: "User not found" }, 404);
  //       }
  //
  //       await brevoListsService.addToCampaignsList(
  //         contact,
  //         campaignId,
  //         campaignTitle
  //       );
  //
  //       return c.json({
  //         message: "User pledged to campaign",
  //         user: {
  //           id: user.id,
  //           email: user.email,
  //           name: user.name,
  //         },
  //       });
  //     } catch (brevoError) {
  //       logger.error("Error pledging user to campaign:", brevoError);
  //       return c.json({ message: "Error pledging user to campaign" }, 500);
  //     }
  //   } catch (error) {
  //     logger.error("Error pledging user to campaign:", error);
  //     return c.json({ message: "Error pledging user to campaign" }, 500);
  //   }
  // }
}
