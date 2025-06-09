import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { logger } from '../utils/logger';

// Validation for event registration
const registerToEventSchema = z.object({
  eventId: z.string(),
  eventTitle: z.string().optional(),
});

export class EventsController {
  async registerToEvent(c: Context) {
    try {
      // Verificar que el usuario esté autenticado
      const user = c.get("user");
      if (!user) {
        return c.json({ message: "Authentication required" }, 401);
      }

      // Validar datos de entrada
      const body = await c.req.json();
      const validation = registerToEventSchema.safeParse(body);

      if (!validation.success) {
        logger.error("Validation errors:", validation.error.format());
        return c.json({ message: "Invalid input data" }, 400);
      }

      const { eventId, eventTitle } = validation.data;
      const brevoListsService = c.get("brevoListsService");

      try {
        // Preparar datos del contacto para Brevo
        const [firstName, ...lastNameParts] = user.name.split(" ");
        const lastName = lastNameParts.join(" ");

        // Obtener el contacto existente para ver si ya está en alguna lista
        const existingContact = await brevoListsService.getContact(user.email);

        let brevoResult;
        if (
          existingContact &&
          existingContact.listIds &&
          existingContact.listIds.includes(25)
        ) {
          // El usuario ya está en la lista de subscribers, agregarlo también a conference attendees
          brevoResult = await brevoListsService.addToBothLists({
            email: user.email,
            attributes: {
              FIRSTNAME: firstName || "",
              LASTNAME: lastName || "",
              EXT_ID: user.id,
              // Agregar información del evento si está disponible
              ...(eventTitle && { LAST_EVENT_REGISTERED: eventTitle }),
            },
          });
        } else {
          // Solo agregarlo a la lista de conference attendees
          brevoResult = await brevoListsService.addToConferenceAttendeesList({
            email: user.email,
            attributes: {
              FIRSTNAME: firstName || "",
              LASTNAME: lastName || "",
              EXT_ID: user.id,
              ...(eventTitle && { LAST_EVENT_REGISTERED: eventTitle }),
            },
          });
        }

        logger.log("✅ User registered to event and added to Brevo:", {
          email: user.email,
          eventId,
          eventTitle,
        });

        return c.json(
          {
            message: "Successfully registered to event",
            eventId,
            eventTitle,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
            brevoRegistered: true,
          },
          200
        );
      } catch (brevoError) {
        logger.error(
          "⚠️ Failed to add user to Brevo Conference Attendees:",
          brevoError
        );

        // Devolver éxito para el registro del evento pero indicar el problema con Brevo
        return c.json(
          {
            message:
              "Registered to event, but there was an issue with email list subscription",
            eventId,
            eventTitle,
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
      logger.error("Error registering to event:", error);
      return c.json({ message: "Error registering to event" }, 500);
    }
  }

  async getEventRegistrationStatus(c: Context) {
    try {
      // Verificar que el usuario esté autenticado
      const user = c.get("user");
      if (!user) {
        return c.json({ message: "Authentication required" }, 401);
      }

      const eventId = c.req.param("eventId");
      if (!eventId) {
        return c.json({ message: "Event ID is required" }, 400);
      }

      const brevoListsService = c.get("brevoListsService");

      try {
        // Verificar si el usuario está en la lista de conference attendees
        const contact = await brevoListsService.getContact(user.email);

        const isRegistered =
          contact && contact.listIds && contact.listIds.includes(23); // Conference Attendees list ID

        return c.json(
          {
            eventId,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
            isRegistered: !!isRegistered,
            registrationDate: contact?.createdAt || null,
          },
          200
        );
      } catch (brevoError) {
        logger.error("Error checking registration status:", brevoError);
        return c.json(
          {
            eventId,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
            isRegistered: false,
            error: "Could not verify registration status",
          },
          200
        );
      }
    } catch (error) {
      logger.error("Error getting event registration status:", error);
      return c.json({ message: "Error getting registration status" }, 500);
    }
  }
}
