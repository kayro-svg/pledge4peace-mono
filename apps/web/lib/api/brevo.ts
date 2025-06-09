import { API_ENDPOINTS } from "@/lib/config";
import { logger } from "@/lib/utils/logger";
// import { getSession } from "next-auth/react";

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
 */
export async function registerToEvent(
  data: EventRegistrationData,
  token: string | undefined
): Promise<EventRegistrationResponse> {
  //   const token = await getAuthToken();

  const response = await fetch(API_ENDPOINTS.events.register, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to register to event");
  }

  return result;
}

/**
 * Suscribe al usuario logueado a la lista de subscribers (para usuarios que no se registraron originalmente)
 */
export async function subscribeToNewsletter(
  token: string | undefined
): Promise<SubscriptionResponse> {
  //   const token = await getAuthToken();

  const response = await fetch(API_ENDPOINTS.users.subscribe, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to subscribe to newsletter");
  }

  return result;
}

/**
 * Verifica si el usuario está registrado a un evento específico
 */
export async function getEventRegistrationStatus(
  eventId: string,
  token: string | undefined
): Promise<EventRegistrationStatusResponse> {
  //   const token = await getAuthToken();

  const response = await fetch(
    API_ENDPOINTS.events.getRegistrationStatus(eventId),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to get registration status");
  }

  return result;
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
