import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "../utils/logger";

export class UsersController {
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
          existingContact &&
          existingContact.listIds &&
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

        const isSubscribed =
          contact && contact.listIds && contact.listIds.includes(25); // Subscribers list ID

        const isConferenceAttendee =
          contact && contact.listIds && contact.listIds.includes(23); // Conference Attendees list ID

        return c.json(
          {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
            isSubscribed: !!isSubscribed,
            isConferenceAttendee: !!isConferenceAttendee,
            subscriptionDate: contact?.createdAt || null,
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

  //     const brevoListsService = c.get("brevoListsService");

  //     const { campaignId, campaignTitle } = await c.req.json();

  //     if (!campaignId || !campaignTitle) {
  //       return c.json({ message: "Campaign ID and title are required" }, 400);
  //     }

  //     try {
  //       const contact = await brevoListsService.getContact(user.email);

  //       if (!contact) {
  //         return c.json({ message: "User not found" }, 404);
  //       }

  //       await brevoListsService.addToCampaignsList(
  //         contact,
  //         campaignId,
  //         campaignTitle
  //       );

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
