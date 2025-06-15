import { logger } from "../utils/logger";
export interface BrevoContact {
  email: string;
  attributes?: {
    FIRSTNAME?: string;
    LASTNAME?: string;
    PHONE?: string;
    SMS?: string;
    WHATSAPP?: string;
    EXT_ID?: string;
    JOB_TITLE?: string;
    LINKEDIN?: string;
    SKILLS?: string;
    [key: string]: any;
  };
  listIds?: number[];
  updateEnabled?: boolean;
}

export interface BrevoListsConfig {
  apiKey: string;
  subscribersListId: number;
  conferenceAttendeesListId: number;
  volunteersListId: number;
}

export class BrevoListsService {
  private apiKey: string;
  private subscribersListId: number;
  private conferenceAttendeesListId: number;
  private volunteersListId: number;
  private baseUrl = "https://api.brevo.com/v3";

  constructor(config: BrevoListsConfig) {
    this.apiKey = config.apiKey;
    this.subscribersListId = config.subscribersListId;
    this.conferenceAttendeesListId = config.conferenceAttendeesListId;
    this.volunteersListId = config.volunteersListId;
  }

  /**
   * Agrega un contacto a la lista de subscribers (usuarios registrados)
   */
  async addToSubscribersList(contact: BrevoContact): Promise<any> {
    const payload = {
      ...contact,
      listIds: [this.subscribersListId],
      updateEnabled: true, // Actualiza si ya existe
    };

    return this.createOrUpdateContact(payload);
  }

  /**
   * Agrega un contacto a la lista de conference attendees (asistentes a conferencias)
   */
  async addToConferenceAttendeesList(contact: BrevoContact): Promise<any> {
    const payload = {
      ...contact,
      listIds: [this.conferenceAttendeesListId],
      updateEnabled: true,
    };

    return this.createOrUpdateContact(payload);
  }

  /**
   * Agrega un contacto a la lista de voluntarios
   */
  async addToVolunteersList(contact: BrevoContact): Promise<any> {
    const payload = {
      ...contact,
      listIds: [this.volunteersListId],
      updateEnabled: true,
    };

    return this.createOrUpdateContact(payload);
  }

  /**
   * Agrega un contacto a ambas listas (si un usuario registrado se apunta a una conferencia)
   */
  async addToBothLists(contact: BrevoContact): Promise<any> {
    const payload = {
      ...contact,
      listIds: [this.subscribersListId, this.conferenceAttendeesListId],
      updateEnabled: true,
    };

    return this.createOrUpdateContact(payload);
  }

  /**
   * Método principal para crear o actualizar un contacto en Brevo
   */
  private async createOrUpdateContact(contact: BrevoContact): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: JSON.stringify(contact),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("Brevo API error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });

        // Si el contacto ya existe (código 400), intentamos actualizarlo
        if (
          response.status === 400 &&
          errorText.includes("Contact already exist")
        ) {
          return this.updateExistingContact(contact);
        }

        throw new Error(`Brevo API error: ${response.status} - ${errorText}`);
      }

      // Handle empty responses
      const responseText = await response.text();
      let result;

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch (error) {
          logger.error("Failed to parse Brevo response as JSON:", responseText);
          result = { success: true, message: "Contact processed successfully" };
        }
      } else {
        result = { success: true, message: "Contact processed successfully" };
      }
      logger.log("✅ Contact added to Brevo successfully:", {
        email: contact.email,
        listIds: contact.listIds,
      });

      return result;
    } catch (error) {
      logger.error("❌ Error adding contact to Brevo:", error);
      throw error;
    }
  }

  /**
   * Actualiza un contacto existente
   */
  private async updateExistingContact(contact: BrevoContact): Promise<any> {
    try {
      const updatePayload = {
        attributes: contact.attributes,
        listIds: contact.listIds,
      };

      const response = await fetch(
        `${this.baseUrl}/contacts/${encodeURIComponent(contact.email)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "api-key": this.apiKey,
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        logger.error("Brevo update contact error:", {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        throw new Error(
          `Brevo update error: ${response.status} - ${errorText}`
        );
      }

      // Handle different response types
      let result;
      if (response.status === 204) {
        result = { success: true };
      } else {
        const responseText = await response.text();
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch (error) {
            logger.error(
              "Failed to parse Brevo update response as JSON:",
              responseText
            );
            result = { success: true, message: "Contact updated successfully" };
          }
        } else {
          result = { success: true, message: "Contact updated successfully" };
        }
      }

      logger.log("✅ Contact updated in Brevo successfully:", {
        email: contact.email,
        listIds: contact.listIds,
      });

      return result;
    } catch (error) {
      logger.error("❌ Error updating contact in Brevo:", error);
      throw error;
    }
  }

  /**
   * Obtiene información de un contacto por email
   */
  async getContact(email: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseUrl}/contacts/${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: {
            "api-key": this.apiKey,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Contacto no encontrado
        }
        const errorText = await response.text();
        throw new Error(
          `Brevo get contact error: ${response.status} - ${errorText}`
        );
      }

      return await response.json();
    } catch (error) {
      logger.error("❌ Error getting contact from Brevo:", error);
      throw error;
    }
  }

  /**
   * Obtiene información de las listas configuradas
   */
  async getListsInfo(): Promise<any> {
    try {
      const [subscribersInfo, attendeesInfo] = await Promise.all([
        this.getListInfo(this.subscribersListId),
        this.getListInfo(this.conferenceAttendeesListId),
      ]);

      return {
        subscribers: subscribersInfo,
        conferenceAttendees: attendeesInfo,
      };
    } catch (error) {
      logger.error("❌ Error getting lists info from Brevo:", error);
      throw error;
    }
  }

  /**
   * Obtiene información de una lista específica
   */
  private async getListInfo(listId: number): Promise<any> {
    const response = await fetch(`${this.baseUrl}/contacts/lists/${listId}`, {
      method: "GET",
      headers: {
        "api-key": this.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Brevo get list error: ${response.status} - ${errorText}`
      );
    }

    return await response.json();
  }

  /**
   * Verifica si un contacto ya está en la lista de voluntarios
   */
  async isEmailInVolunteersList(email: string): Promise<boolean> {
    try {
      const contact = await this.getContact(email);

      if (contact && contact.listIds && Array.isArray(contact.listIds)) {
        return contact.listIds.includes(this.volunteersListId);
      }

      return false;
    } catch (error) {
      logger.error("❌ Error checking if email is in volunteers list:", error);
      // En caso de error, devolvemos false para permitir que continúe el proceso
      return false;
    }
  }
}
