import { API_ENDPOINTS } from "@/lib/config";
import { logger } from "@/lib/utils/logger";
import { apiClient } from "@/lib/api-client";

interface EventRegistrationData {
  eventId: string;
  eventTitle?: string;
}

interface EventRegistrationResponse {
  message: string;
  eventId: string;
  eventTitle?: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  brevoRegistered: boolean;
  brevoError?: string;
}

interface EventRegistrationStatusResponse {
  eventId: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  isRegistered: boolean;
  registrationDate?: string;
  error?: string;
}

interface SubscriptionResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  brevoRegistered: boolean;
  brevoError?: string;
}

/**
 * Helper para obtener el token de autenticación desde NextAuth
 */
// async function getAuthToken(): Promise<string | boolean> {
//   const session = await getSession();

//   if (!session?.accessToken) {
//     return false;
//   }

//   return session?.accessToken;
// }

/**
 * Registra al usuario a un evento y lo agrega a la lista de Conference Attendees en Brevo
 * Now uses apiClient with automatic session management
 */
export async function registerToEvent(
  data: EventRegistrationData
): Promise<EventRegistrationResponse> {
  try {
    // Extract endpoint path from API_ENDPOINTS.events.register
    const endpoint = API_ENDPOINTS.events.register.replace(
      process.env.NEXT_PUBLIC_API_URL || "",
      ""
    );
    return await apiClient.post<EventRegistrationResponse>(endpoint, data);
  } catch (error) {
    // apiClient handles session expiration automatically
    throw new Error("Failed to register to event");
  }
}

/**
 * Suscribe al usuario logueado a la lista de subscribers (para usuarios que no se registraron originalmente)
 * Now uses apiClient with automatic session management
 */
export async function subscribeToNewsletter(): Promise<SubscriptionResponse> {
  try {
    // Extract endpoint path from API_ENDPOINTS.users.subscribe
    const endpoint = API_ENDPOINTS.users.subscribe.replace(
      process.env.NEXT_PUBLIC_API_URL || "",
      ""
    );
    return await apiClient.post<SubscriptionResponse>(endpoint);
  } catch (error) {
    // apiClient handles session expiration automatically
    throw new Error("Failed to subscribe to newsletter");
  }
}

/**
 * Verifica si el usuario está registrado a un evento específico
 * Now uses apiClient with automatic session management
 */
export async function getEventRegistrationStatus(
  eventId: string
): Promise<EventRegistrationStatusResponse> {
  try {
    // Extract endpoint path from API_ENDPOINTS.events.getRegistrationStatus
    const endpoint = API_ENDPOINTS.events
      .getRegistrationStatus(eventId)
      .replace(process.env.NEXT_PUBLIC_API_URL || "", "");
    return await apiClient.get<EventRegistrationStatusResponse>(endpoint);
  } catch (error) {
    // apiClient handles session expiration automatically
    throw new Error("Failed to get registration status");
  }
}

/**
 * Helper para mostrar notificaciones de registro exitoso
 */
export function showRegistrationSuccess(data: EventRegistrationResponse): void {
  if (data.brevoRegistered) {
    logger.log("✅ Successfully registered to event and added to Brevo:", data);
  } else {
    logger.warn(
      "⚠️ Registered to event but there was an issue with Brevo:",
      data.brevoError
    );
  }
}

/**
 * Helper para mostrar notificaciones de suscripción exitosa
 */
export function showSubscriptionSuccess(data: SubscriptionResponse): void {
  if (data.brevoRegistered) {
    logger.log("✅ Successfully subscribed to newsletter:", data);
  } else {
    logger.warn(
      "⚠️ Subscription processed but there was an issue with Brevo:",
      data.brevoError
    );
  }
}

/**
 * Helper para manejar errores de registro
 */
export function handleRegistrationError(error: any): void {
  logger.error("❌ Event registration error:", error);

  if (error.message?.includes("Authentication required")) {
    // Redirigir a login o mostrar modal de login
    logger.log("Authentication required - redirecting to login");
    alert("Please log in to register for this event.");
    window.location.href = "/login";
  } else {
    // Mostrar error genérico
    alert(error.message || "An error occurred while registering to the event");
  }
}

/**
 * Helper para manejar errores de suscripción
 */
export function handleSubscriptionError(error: any): void {
  logger.error("❌ Newsletter subscription error:", error);

  if (error.message?.includes("Authentication required")) {
    // Redirigir a login o mostrar modal de login
    alert("Please log in to subscribe to the newsletter.");
    window.location.href = "/login";
  } else {
    // Mostrar error genérico
    alert(
      error.message || "An error occurred while subscribing to the newsletter"
    );
  }
}
