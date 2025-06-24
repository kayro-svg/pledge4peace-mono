// ARCHIVO DE EJEMPLO - PUEDES ELIMINARLO DESPUÉS
// Este archivo muestra cómo usar Google Analytics en tus componentes

"use client";

import React from "react";
import { useAnalytics } from "@/hooks/use-analytics";

export function ExampleUsage() {
  const {
    track,
    trackPage,
    trackButtonClick,
    trackFormSubmit,
    trackPledgeCreated,
    trackVolunteerRegistration,
    trackCampaignView,
    trackFacebookCustom,
  } = useAnalytics();

  const handleButtonClick = () => {
    // Esto enviará eventos tanto a Google Analytics como a Facebook Pixel
    trackButtonClick("cta_button", "homepage");
  };

  const handleFormSubmit = () => {
    // Esto enviará eventos tanto a Google Analytics como a Facebook Pixel
    trackFormSubmit("contact_form", true);
  };

  const handlePledgeCreated = (pledgeId: string) => {
    // Esto enviará eventos a GA y un evento Lead a Facebook Pixel
    trackPledgeCreated(pledgeId, "peace");
  };

  const handleVolunteerRegistration = () => {
    // Esto enviará eventos a GA y un evento CompleteRegistration a Facebook Pixel
    trackVolunteerRegistration("event_123");
  };

  const handleCampaignView = () => {
    // Esto enviará eventos a GA y un evento ViewContent a Facebook Pixel
    trackCampaignView("campaign_123", "Peace Campaign");
  };

  const handleCustomFacebookEvent = () => {
    // Solo para Facebook Pixel - evento personalizado
    trackFacebookCustom("CustomPeaceAction", {
      action_type: "petition_signed",
      value: 1,
    });
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
        onClick={handleFormSubmit}
        className="px-4 py-2 bg-purple-500 text-white rounded"
      >
        Track Form Submit
      </button>

      <button
        onClick={() => handlePledgeCreated("pledge_123")}
        className="px-4 py-2 bg-green-500 text-white rounded"
      >
        Track Pledge Created
      </button>

      <button
        onClick={handleVolunteerRegistration}
        className="px-4 py-2 bg-orange-500 text-white rounded"
      >
        Track Volunteer Registration
      </button>

      <button
        onClick={handleCampaignView}
        className="px-4 py-2 bg-yellow-500 text-white rounded"
      >
        Track Campaign View
      </button>

      <button
        onClick={handleCustomFacebookEvent}
        className="px-4 py-2 bg-red-500 text-white rounded"
      >
        Track Custom Facebook Event
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

// Eventos estándar de Facebook Pixel que ya están integrados:
/*
1. PageView - Se ejecuta automáticamente en trackPage()
2. Lead - Se ejecuta en trackPledgeCreated() 
3. CompleteRegistration - Se ejecuta en trackVolunteerRegistration()
4. ViewContent - Se ejecuta en trackCampaignView()

Para eventos personalizados, usa trackFacebookCustom()
*/
