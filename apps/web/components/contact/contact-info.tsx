import { MapPin, Mail, Phone } from "lucide-react";
import { IconCard } from "./icon-card";
import { MissionBox } from "./mission-box";

interface ContactInfoProps {
  title?: string;
  subtitle?: string;
  address?: string;
  email?: string;
  phone?: string;
  missionTitle?: string;
  missionDescription?: string;
}

export function ContactInfo({
  title = "Contact Information",
  subtitle = "We'd love to hear from you. Reach out using any of the contact methods below or visit our office.",
  address = "3393 NY-6, South New Berlin, NY 13843",
  email = "info@pledge4peace.org",
  phone = "+1 862-666-1636",
  missionTitle = "Our Mission",
  missionDescription = "Pledge4Peace.org advocates for peace, democracy, and equal rights for all, regardless of religion, color, ethnicity, gender etc. Our mission is to strengthen global democracy by inspiring the peace-loving silent majority. Operated entirely by peace volunteers, we do not accept donations for ourselves but encourage pledges and contributions to political parties ranked high on the Peace and Democracy Index.",
}: ContactInfoProps) {
  return (
    <div className="flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-6 text-gray-900">{title}</h2>
        <p className="text-gray-600 mb-8">{subtitle}</p>

        <div className="space-y-6">
          <IconCard icon={MapPin} title="Visit Us" description={address} />

          <IconCard icon={Mail} title="Email Us" description={email} />

          <IconCard icon={Phone} title="Call Us" description={phone} />
        </div>
      </div>

      <MissionBox title={missionTitle} description={missionDescription} />
    </div>
  );
}
