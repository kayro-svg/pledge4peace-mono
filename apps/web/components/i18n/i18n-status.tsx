"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function I18nStatus() {
  const locale = useLocale();
  const pathname = usePathname();

  // Convert locale prefix to string for display
  const localePrefixString =
    typeof routing.localePrefix === "object"
      ? routing.localePrefix.mode
      : String(routing.localePrefix);

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Internationalization Status</CardTitle>
        <CardDescription>
          Current configuration for i18n in your application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="font-medium">Current Locale:</div>
          <div>
            <Badge variant="outline" className="font-mono">
              {locale}
            </Badge>
          </div>

          <div className="font-medium">Available Locales:</div>
          <div className="flex gap-2 flex-wrap">
            {routing.locales.map((l) => (
              <Badge
                key={l}
                variant={l === locale ? "default" : "outline"}
                className="font-mono"
              >
                {l}
              </Badge>
            ))}
          </div>

          <div className="font-medium">Default Locale:</div>
          <div>
            <Badge variant="outline" className="font-mono">
              {routing.defaultLocale}
            </Badge>
          </div>

          <div className="font-medium">Current Path:</div>
          <div>
            <Badge variant="outline" className="font-mono">
              {pathname}
            </Badge>
          </div>

          <div className="font-medium">Locale Prefix Strategy:</div>
          <div>
            <Badge variant="outline" className="font-mono">
              {localePrefixString}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
