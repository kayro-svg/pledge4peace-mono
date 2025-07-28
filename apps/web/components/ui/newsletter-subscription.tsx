"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";
import {
  subscribeToNewsletter,
  showSubscriptionSuccess,
  handleSubscriptionError,
} from "@/lib/api/brevo";
import { API_ENDPOINTS } from "@/lib/config";
import { useAuthSession } from "@/hooks/use-auth-session";
import { toast } from "sonner";
import { logger } from "@/lib/utils/logger";

interface SubscriptionStatus {
  isSubscribed: boolean;
  isConferenceAttendee: boolean;
  loading: boolean;
  error: string | null;
}

export default function NewsletterSubscription() {
  const { session, status: sessionStatus, isAuthenticated } = useAuthSession();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    isConferenceAttendee: false,
    loading: true,
    error: null,
  });
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Verificar el estado de suscripción al cargar el componente
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      checkSubscriptionStatus();
    } else if (sessionStatus === "unauthenticated") {
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: "Not logged in",
      }));
    }
  }, [sessionStatus, session]);

  const checkSubscriptionStatus = async () => {
    try {
      if (!session?.accessToken) {
        setStatus((prev) => ({
          ...prev,
          loading: false,
          error: "Not logged in",
        }));
        return;
      }

      const response = await fetch(API_ENDPOINTS.users.subscriptionStatus, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({
          isSubscribed: data.isSubscribed,
          isConferenceAttendee: data.isConferenceAttendee,
          loading: false,
          error: null,
        });
      } else {
        setStatus((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to check status",
        }));
      }
    } catch (error) {
      logger.error("Error checking subscription status:", error);
      setStatus((prev) => ({
        ...prev,
        loading: false,
        error: "Network error",
      }));
    }
  };

  const handleSubscribe = async () => {
    try {
      setIsSubscribing(true);
      const data = await subscribeToNewsletter();

      //   showSubscriptionSuccess(data);
      if (data.brevoRegistered) {
        toast.success("Successfully subscribed to our newsletter!");
        setStatus((prev) => ({ ...prev, isSubscribed: true }));
      } else {
        toast.error("There was an error subscribing to the newsletter.");
        setStatus((prev) => ({ ...prev, isSubscribed: false }));
      }
      setStatus((prev) => ({ ...prev, isSubscribed: true }));

      // Mostrar mensaje de éxito
      alert("Successfully subscribed to our newsletter!");
    } catch (error) {
      handleSubscriptionError(error);
    } finally {
      setIsSubscribing(false);
    }
  };

  // No mostrar nada si está cargando
  if (status.loading || sessionStatus === "loading") {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#548281]"></div>
      </div>
    );
  }

  // No mostrar nada si hay error de autenticación
  if (status.error === "Not logged in") {
    return null;
  }

  // Si ya está suscrito, mostrar estado
  if (status.isSubscribed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">
            You're subscribed to our newsletter!
          </p>
          <p className="text-xs text-green-600">
            {status.isConferenceAttendee
              ? "You're also registered for conference updates."
              : "Subscribe to events to get conference updates too."}
          </p>
        </div>
      </div>
    );
  }

  // Mostrar botón de suscripción
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800 mb-1">
            Stay updated with Pledge4Peace
          </h3>
          <p className="text-xs text-blue-600 mb-3">
            Get the latest news about our peace initiatives and upcoming events.
          </p>
          <Button
            onClick={handleSubscribe}
            disabled={isSubscribing}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubscribing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Subscribing...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Subscribe to Newsletter
              </>
            )}
          </Button>
        </div>
      </div>

      {status.error && (
        <div className="mt-3 flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs">{status.error}</span>
        </div>
      )}
    </div>
  );
}
