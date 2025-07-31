import { Metadata } from "next";
import { CookiePreferencesCenter } from "@/components/cookies/cookie-preferences-center";

export const metadata: Metadata = {
  title: "Preferencias de Cookies | Pledge4Peace",
  description:
    "Gestiona tus preferencias de cookies y privacidad en Pledge4Peace",
  robots: "noindex, nofollow", // No indexar esta página de configuración
};

export default function CookiePreferencesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <CookiePreferencesCenter />
      </div>
    </div>
  );
}
