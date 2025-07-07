// import { Context } from "hono";
// import { drizzle } from "drizzle-orm/d1";
// import { pledges, campaignPledgeCounts } from "../db/schema/pledges";
// import { users } from "../db/schema/users";
// import { and, eq, sql } from "drizzle-orm";
// import { logger } from "../utils/logger";
// import { z } from "zod";

// /* -------------------------  Validación de entrada  ------------------------ */
// const createPledgeSchema = z.object({
//   campaignId: z.string().min(1),
//   campaignTitle: z.string().min(1),
//   agreeToTerms: z.literal(true), //  Debe ser true
//   subscribeToUpdates: z.boolean().optional(),
// });

// /* ------------------------------------------------------------------------- */
// export class PledgesController {
//   /* ---------- GET /campaign/:campaignId/count ----------- */
//   async getCampaignPledgeCount(c: Context) {
//     try {
//       const { campaignId } = c.req.param();
//       const db = drizzle(c.env.DB);

//       // 1️⃣ Intentar leer el recuento cacheado
//       const cached = await db
//         .select()
//         .from(campaignPledgeCounts)
//         .where(eq(campaignPledgeCounts.campaignId, campaignId))
//         .limit(1)
//         .then((r) => r[0]);

//       if (cached) {
//         return c.json({ count: cached.count });
//       }

//       // 2️⃣ Contar directamente desde pledges
//       const directCount = await db
//         .select({ count: sql`count(*)` })
//         .from(pledges)
//         .where(
//           and(eq(pledges.campaignId, campaignId), eq(pledges.status, "active"))
//         )
//         .then((r) => (r[0]?.count as number) ?? 0);

//       // 3️⃣ Guardar cache para futuras peticiones
//       await db.insert(campaignPledgeCounts).values({
//         campaignId,
//         count: directCount,
//         lastUpdated: new Date(),
//       });

//       return c.json({ count: directCount });
//     } catch (error) {
//       logger.error("Error getting pledge count:", error);
//       return c.json({ error: "Failed to get pledge count" }, 500);
//     }
//   }

//   /* ------------- GET /check/:campaignId (auth) ------------- */
//   async checkUserHasPledged(c: Context) {
//     try {
//       const { campaignId } = c.req.param();
//       const db = drizzle(c.env.DB);
//       const userId = c.get("userId");

//       const existing = await db
//         .select()
//         .from(pledges)
//         .where(
//           and(
//             eq(pledges.campaignId, campaignId),
//             eq(pledges.userId, userId),
//             eq(pledges.status, "active")
//           )
//         )
//         .limit(1)
//         .then((r) => r[0]);

//       return c.json({ hasPledged: !!existing });
//     } catch (error) {
//       logger.error("Error checking pledge status:", error);
//       return c.json({ error: "Failed to check pledge status" }, 500);
//     }
//   }

//   /* ------------------- POST / (auth) -------------------- */
//   async createPledge(c: Context) {
//     try {
//       /* 1. Validar entrada */
//       const body = await c.req.json();
//       const validation = createPledgeSchema.safeParse(body);

//       if (!validation.success) {
//         return c.json({ error: "Invalid pledge data" }, 400);
//       }

//       const { campaignId, campaignTitle, subscribeToUpdates } = validation.data;
//       const db = drizzle(c.env.DB);
//       const userId = c.get("userId");

//       /* 2. Verificar si el usuario ya ha pledgeado */
//       const existingPledge = await db
//         .select()
//         .from(pledges)
//         .where(
//           and(
//             eq(pledges.campaignId, campaignId),
//             eq(pledges.userId, userId),
//             eq(pledges.status, "active")
//           )
//         )
//         .limit(1)
//         .then((r) => r[0]);

//       if (existingPledge) {
//         const countRow = await db
//           .select({ count: campaignPledgeCounts.count })
//           .from(campaignPledgeCounts)
//           .where(eq(campaignPledgeCounts.campaignId, campaignId))
//           .then((r) => r[0]);

//         return c.json(
//           {
//             success: true,
//             pledge: existingPledge,
//             pledgeCount: countRow?.count || 1,
//             alreadyPledged: true,
//           },
//           200
//         );
//       }

//       /* 3. Crear el pledge */
//       const newPledge = await db
//         .insert(pledges)
//         .values({
//           id: crypto.randomUUID(),
//           campaignId,
//           userId,
//           agreeToTerms: true,
//           subscribeToUpdates: Boolean(subscribeToUpdates),
//           createdAt: new Date(),
//           status: "active",
//         })
//         .returning()
//         .then((r) => r[0]);

//       /* 4. Upsert del contador */
//       await db
//         .insert(campaignPledgeCounts)
//         .values({
//           campaignId,
//           count: 1,
//           lastUpdated: new Date(),
//         })
//         .onConflictDoUpdate({
//           target: campaignPledgeCounts.campaignId,
//           set: {
//             count: sql`${campaignPledgeCounts.count} + 1`,
//             lastUpdated: new Date(),
//           },
//         });

//       const countRow = await db
//         .select({ count: campaignPledgeCounts.count })
//         .from(campaignPledgeCounts)
//         .where(eq(campaignPledgeCounts.campaignId, campaignId))
//         .then((r) => r[0]);

//       /* 5. Notificación (best-effort) */
//       const userInfo = await db
//         .select({ name: users.name, email: users.email })
//         .from(users)
//         .where(eq(users.id, userId))
//         .limit(1)
//         .then((r) => r[0]);

//       if (userInfo) {
//         const authService = c.get("authService");
//         if (authService) {
//           try {
//             await authService.emailService.sendPledgeNotification({
//               userName: userInfo.name,
//               userEmail: userInfo.email,
//               campaignTitle,
//               pledgeDate: new Date().toLocaleString("en-US", {
//                 year: "numeric",
//                 month: "long",
//                 day: "numeric",
//                 hour: "2-digit",
//                 minute: "2-digit",
//                 timeZoneName: "short",
//               }),
//               subscribeToUpdates: Boolean(subscribeToUpdates),
//             });
//             logger.log(
//               "✅ Pledge notification sent to admin:",
//               userInfo.email,
//               "for campaign:",
//               campaignId
//             );
//           } catch (emailErr) {
//             logger.error(
//               "⚠️ Failed to send pledge notification to admin:",
//               emailErr
//             );
//           }

//           // 6. Agregar al Brevo - Campaigns List
//           const brevoListsService = c.get("brevoListsService");
//           if (brevoListsService) {
//             const brevoResponse = await brevoListsService.addToCampaignsList(
//               userInfo,
//               campaignId,
//               campaignTitle
//             );
//             logger.log(
//               "✅ Pledge notification sent to Brevo - Campaigns List:",
//               brevoResponse
//             );
//           }
//         }
//       }

//       return c.json(
//         {
//           success: true,
//           pledge: newPledge,
//           pledgeCount: countRow?.count || 1,
//         },
//         201
//       );
//     } catch (error) {
//       logger.error("Error creating pledge:", error);
//       return c.json(
//         {
//           error: "Failed to create pledge",
//           details: error instanceof Error ? error.message : "Unknown error",
//         },
//         500
//       );
//     }
//   }
// }
