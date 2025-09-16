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
    P4PCAMPAIGNID?: string;
    P4PCAMPAIGNTITLE?: string;
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
  // User type specific lists
  citizensListId: number;
  politiciansListId: number;
  organizationsListId: number;
  nonprofitsListId: number;
  studentsListId: number;
  othersListId: number;
  campaignsListId: number;
}

export class BrevoListsService {
  private apiKey: string;
  private subscribersListId: number;
  private conferenceAttendeesListId: number;
  private volunteersListId: number;
  // User type specific lists
  private citizensListId: number;
  private politiciansListId: number;
  private organizationsListId: number;
  private nonprofitsListId: number;
  private studentsListId: number;
  private othersListId: number;
  private campaignsListId: number;
  private baseUrl = "https://api.brevo.com/v3";

  constructor(config: BrevoListsConfig) {
    this.apiKey = config.apiKey;
    this.subscribersListId = config.subscribersListId;
    this.conferenceAttendeesListId = config.conferenceAttendeesListId;
    this.volunteersListId = config.volunteersListId;
    // User type specific lists
    this.citizensListId = config.citizensListId;
    this.politiciansListId = config.politiciansListId;
    this.organizationsListId = config.organizationsListId;
    this.nonprofitsListId = config.nonprofitsListId;
    this.studentsListId = config.studentsListId;
    this.othersListId = config.othersListId;
    this.campaignsListId = config.campaignsListId;
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
   * Agrega un contacto a la lista de subscribers y a la lista específica según el tipo de usuario
   */
  async addToSubscribersAndUserTypeList(
    contact: BrevoContact,
    userType: string
  ): Promise<any> {
    const userTypeListId = this.getUserTypeListId(userType);
    const userTypeListName = this.getUserTypeListName(userType);

    const payload = {
      ...contact,
      listIds: [this.subscribersListId, userTypeListId],
      updateEnabled: true,
    };

    logger.log(
      `📧 Adding contact to Subscribers list and ${userTypeListName} list:`,
      {
        email: contact.email,
        userType,
        listIds: payload.listIds,
      }
    );

    return this.createOrUpdateContact(payload);
  }

  /**
   * Agrega un contacto solo a la lista específica según el tipo de usuario
   */
  async addToUserTypeList(
    contact: BrevoContact,
    userType: string
  ): Promise<any> {
    const userTypeListId = this.getUserTypeListId(userType);

    const payload = {
      ...contact,
      listIds: [userTypeListId],
      updateEnabled: true,
    };

    return this.createOrUpdateContact(payload);
  }

  /**
   * Obtiene el ID de la lista específica según el tipo de usuario
   */
  private getUserTypeListId(userType: string): number {
    switch (userType) {
      case "citizen":
        return this.citizensListId;
      case "politician":
        return this.politiciansListId;
      case "organization":
        return this.organizationsListId;
      case "nonprofit":
        return this.nonprofitsListId;
      case "student":
        return this.studentsListId;
      case "other":
        return this.othersListId;
      default:
        logger.error(
          `Unknown user type: ${userType}, defaulting to citizens list`
        );
        return this.citizensListId;
    }
  }

  /**
   * Obtiene el nombre de la lista según el tipo de usuario (para logging)
   */
  public getUserTypeListName(userType: string): string {
    switch (userType) {
      case "citizen":
        return "P4P - citizens/Advocates";
      case "politician":
        return "P4P - Politicians";
      case "organization":
        return "P4P - Organizations";
      case "nonprofit":
        return "P4P - Nonprofits";
      case "student":
        return "P4P - Students";
      case "other":
        return "P4P - Others";
      default:
        return "P4P - citizens/Advocates (default)";
    }
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
          (errorText || "").includes("Contact already exist")
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

  /**
   * Agrega / actualiza al contacto en la lista "P4P – Campaigns" (#69)
   * ▸ Si ya tiene otros pledges, los conserva y añade el nuevo (id + título)
   * ▸ Los valores quedan unidos por comas en el MISMO campo
   */
  async addToCampaignsList(
    contact: BrevoContact, // ⇢ { email, attributes: { FIRSTNAME, ... } }
    campaignId: string,
    campaignTitle: string
  ): Promise<any> {
    /* 1️⃣  Leer contacto actual (si existe) ---------------------------- */
    let existing: any = null;
    try {
      existing = await this.getContact(contact.email);
    } catch {
      /* 404 ⇒ sigue como null */
    }

    /* 2️⃣  Construir sets con los valores existentes + el nuevo -------- */
    const idSet = new Set<string>();
    const titleSet = new Set<string>();

    // Verificar que existing y existing.attributes existan antes de acceder
    if (existing && existing.attributes && existing.attributes.P4PCAMPAIGNID) {
      for (const id of (existing.attributes.P4PCAMPAIGNID as string).split(
        ","
      )) {
        if (id.trim()) idSet.add(id.trim());
      }
    }
    if (
      existing &&
      existing.attributes &&
      existing.attributes.P4PCAMPAIGNTITLE
    ) {
      for (const t of (existing.attributes.P4PCAMPAIGNTITLE as string).split(
        ","
      )) {
        if (t.trim()) titleSet.add(t.trim());
      }
    }

    idSet.add(campaignId);
    titleSet.add(campaignTitle);

    /* 3️⃣  Upsert con los valores fusionados --------------------------- */
    const payload: BrevoContact = {
      ...contact, // FIRSTNAME, LASTNAME, etc.
      listIds: [this.campaignsListId],
      updateEnabled: true,
      attributes: {
        ...contact.attributes,
        P4PCAMPAIGNID: [...idSet].join(","), // "idA,idB,idC"
        P4PCAMPAIGNTITLE: [...titleSet].join(","), // "Campaña A,Campaña B"
      },
    };

    return this.createOrUpdateContact(payload);
  }
}
