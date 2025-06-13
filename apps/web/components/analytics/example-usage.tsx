// ARCHIVO DE EJEMPLO - PUEDES ELIMINARLO DESPUÉS
// Este archivo muestra cómo usar Google Analytics en tus componentes

"use client";

import React from "react";
import { useAnalytics } from "@/hooks/use-analytics";

export function ExampleComponent() {
  const analytics = useAnalytics();

  const handlePledgeSubmit = () => {
    // Ejemplo: trackear cuando alguien hace un pledge
    analytics.trackPledgeCreated("pledge-123", "peace");
    console.log("Pledge tracked in Google Analytics");
  };

  const handleButtonClick = () => {
    // Ejemplo: trackear clicks de botones
    analytics.trackButtonClick("example-button", "home-page");
    console.log("Button click tracked in Google Analytics");
  };

  const handleFormSubmit = (success: boolean) => {
    // Ejemplo: trackear envío de formularios
    analytics.trackFormSubmit("contact-form", success);
    console.log("Form submit tracked in Google Analytics");
  };

  const handleVolunteerRegistration = () => {
    // Ejemplo: trackear registro de voluntarios
    analytics.trackVolunteerRegistration("event-456");
    console.log("Volunteer registration tracked in Google Analytics");
  };

  const handleCustomEvent = () => {
    // Ejemplo: trackear evento personalizado
    analytics.track("custom_event", {
      category: "user_interaction",
      action: "custom_action",
      value: 1,
    });
    console.log("Custom event tracked in Google Analytics");
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Google Analytics - Ejemplos de Uso</h2>

      <button
        onClick={handleButtonClick}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Track Button Click
      </button>

      <button
        onClick={handlePledgeSubmit}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Track Pledge Created
      </button>

      <button
        onClick={() => handleFormSubmit(true)}
        className="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Track Form Submit (Success)
      </button>

      <button
        onClick={handleVolunteerRegistration}
        className="px-4 py-2 bg-orange-500 text-white rounded"
      >
        Track Volunteer Registration
      </button>

      <button
        onClick={handleCustomEvent}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Track Custom Event
      </button>

      <div className="mt-4 p-3 bg-gray-100 rounded">
        <p className="text-sm text-gray-600">
          Los eventos se envían a Google Analytics con el ID: G-TYG0P9296E
          <br />
          Puedes verificar los eventos en tiempo real en Google Analytics.
        </p>
      </div>
    </div>
  );
}

// EJEMPLO DE USO EN OTROS COMPONENTES:
/*
import { useAnalytics } from '@/hooks/use-analytics';

export function MiComponente() {
  const analytics = useAnalytics();

  const handleClick = () => {
    analytics.trackButtonClick('mi-boton', 'mi-pagina');
  };

  return <button onClick={handleClick}>Mi Botón</button>;
}
*/
