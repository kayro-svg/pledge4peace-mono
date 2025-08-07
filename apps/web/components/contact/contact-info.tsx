import { MapPin, Mail, Phone } from "lucide-react";
import { IconCard } from "./icon-card";
import { MissionBox } from "./mission-box";
import { useTranslations } from "next-intl";

export function ContactInfo() {
  const t = useTranslations("Contact_Page");
  return (
    <div className="flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {t("contact_info_title")}
        </h2>
        <p className="text-gray-600 mb-8">{t("contact_info_subtitle")}</p>

        <div className="space-y-6">
          <IconCard
            icon={MapPin}
            title={t("contact_info_visit_us")}
            description={"3393 NY-6, South New Berlin, NY 13843"}
          />

          <IconCard
            icon={Mail}
            title={t("contact_info_email_us")}
            description="info@pledge4peace.org"
          />

          <IconCard
            icon={Phone}
            title={t("contact_info_call_us")}
            description="+1 862-666-1636"
          />
        </div>
      </div>

      <MissionBox
        title={t("contact_info_mission_title")}
        description={t("contact_info_mission_description")}
      />
    </div>
  );
}
