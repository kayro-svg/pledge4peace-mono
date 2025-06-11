"use client";

import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConsentManager } from "@/lib/cookies/consent-manager";
import Link from "next/link";

// export const metadata: Metadata = {
//   title: "Política de Cookies | Pledge4Peace",
//   description: "Información sobre el uso de cookies en Pledge4Peace",
// };

export default function CookiePolicyPage() {
  const cookiesByCategory = ConsentManager.getCookiesByCategory();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Cookie Policy</CardTitle>
              <p className="text-gray-600">
                Last updated: {new Date().toLocaleDateString("es-ES")}
              </p>
            </CardHeader>
          </Card>

          {/* Introducción */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">What are cookies?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Cookies are small text files that are stored on your device when
                you visit a website. They allow us to recognize your browser and
                capture certain information to improve your navigation
                experience.
              </p>

              <p>
                At Pledge4Peace, we use cookies to ensure the basic functioning
                of the website, remember your preferences and analyze how you
                interact with our services.
              </p>
            </CardContent>
          </Card>

          {/* Tipos de cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Types of cookies we use</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(cookiesByCategory).map(
                  ([category, cookies]) => {
                    const categoryNames = {
                      necessary: "Necessary Cookies",
                      functional: "Functional Cookies",
                      analytics: "Analytics Cookies",
                      marketing: "Marketing Cookies",
                    };

                    const categoryDescriptions = {
                      necessary:
                        "These cookies are essential for the basic functioning of the website and cannot be disabled in our systems.",
                      functional:
                        "These cookies allow the website to provide improved functionality and customization.",
                      analytics:
                        "These cookies allow us to count visits and traffic sources to measure and improve the performance of the website.",
                      marketing:
                        "These cookies may be placed on the entire website by our advertising partners.",
                    };

                    return (
                      <div key={category} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">
                            {
                              categoryNames[
                                category as keyof typeof categoryNames
                              ]
                            }
                          </h3>
                          <Badge
                            variant={
                              category === "necessary" ? "default" : "secondary"
                            }
                          >
                            {category === "necessary" ? "Required" : "Optional"}
                          </Badge>
                        </div>

                        <p className="text-gray-600">
                          {
                            categoryDescriptions[
                              category as keyof typeof categoryDescriptions
                            ]
                          }
                        </p>

                        {cookies.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium">
                              Cookies in this category:
                            </h4>
                            <div className="grid gap-3">
                              {cookies.map((cookie, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 p-4 rounded-lg"
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium">
                                      {cookie.name}
                                    </span>
                                    <Badge variant="outline">
                                      {cookie.duration}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-1">
                                    {cookie.description}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Provider: {cookie.provider}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>

          {/* Gestión de cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">How to manage cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                You have the right to decide whether to accept or reject
                cookies. You can manage your cookie preferences through:
              </p>

              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Our cookie preferences center</li>
                <li>Your web browser settings</li>
                <li>Third-party tools available online</li>
              </ul>

              <div className="flex gap-4 mt-6">
                <Link href="/cookie-preferences">
                  <Button>Manage Preferences</Button>
                </Link>
                <Button variant="outline" onClick={() => window.history.back()}>
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Configuración del navegador */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Browser settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Most web browsers allow you to control cookies through their
                settings. Here are links to instructions for the most popular
                browsers:
              </p>

              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 hover:underline"
                  >
                    Google Chrome
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 hover:underline"
                  >
                    Mozilla Firefox
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 hover:underline"
                  >
                    Safari
                  </a>
                </li>
                <li>
                  <a
                    href="https://support.microsoft.com/en-us/help/17442/windows-internet-explorer-delete-manage-cookies"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 hover:underline"
                  >
                    Microsoft Edge
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Cambios en la política */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Changes to this policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                We may update our Cookie Policy occasionally to reflect changes
                in our practices or for other operational, legal or regulatory
                reasons.
              </p>

              <p>
                We recommend that you review this policy periodically to stay
                informed about how we use cookies.
              </p>
            </CardContent>
          </Card>

          {/* Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                If you have questions about this Cookie Policy, you can contact
                us:
              </p>

              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>By email: privacy@pledge4peace.org</li>
                <li>
                  Through our{" "}
                  <Link
                    href="/contact"
                    className="text-brand-500 hover:underline"
                  >
                    contact form
                  </Link>
                </li>
              </ul>

              <div className="flex gap-4 mt-6">
                <Link href="/terms-and-conditions">
                  <Button variant="outline">Terms and Conditions</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
