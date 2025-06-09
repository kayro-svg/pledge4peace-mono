import {
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Award,
} from "lucide-react";
import {
  SanityAboutGetInTouchCard,
  SanityAboutCommitmentCard,
} from "@/lib/types";

interface ContactInformationProps {
  getInTouchCard: SanityAboutGetInTouchCard;
  ourCommitmentCard: SanityAboutCommitmentCard;
}

export default function ContactInformationAndCommitment({
  getInTouchCard,
  ourCommitmentCard,
}: ContactInformationProps) {
  // Helper function to get social media icon
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <Facebook className="h-5 w-5" />;
      case "twitter":
        return <Twitter className="h-5 w-5" />;
      case "instagram":
        return <Instagram className="h-5 w-5" />;
      case "linkedin":
        return <Linkedin className="h-5 w-5" />;
      case "youtube":
        return <Youtube className="h-5 w-5" />;
      default:
        return <MessageCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="my-20 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="bg-white p-8 rounded-3xl shadow-lg">
        <div className="w-12 h-12 rounded-full bg-white border-[3px] border-[#548281] flex items-center justify-center mb-4">
          <MessageCircle className="h-6 w-6 text-[#548281]" />
        </div>
        <h3 className="text-2xl font-bold mb-6 text-[#2F4858]">
          {getInTouchCard.getInTouchHeading}
        </h3>
        <div className="space-y-4 text-lg">
          {getInTouchCard.contactInformation.email && (
            <p className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-[#548281]" />
              <span className="font-semibold text-gray-700">Email:</span>
              <span>{getInTouchCard.contactInformation.email}</span>
            </p>
          )}
          {getInTouchCard.contactInformation.phone && (
            <p className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-[#548281]" />
              <span className="font-semibold text-gray-700">Phone:</span>
              <span>{getInTouchCard.contactInformation.phone}</span>
            </p>
          )}
          {getInTouchCard.contactInformation.address && (
            <p className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-[#548281]" />
              <span className="font-semibold text-gray-700">Address:</span>
              <span>{getInTouchCard.contactInformation.address}</span>
            </p>
          )}
          {/* Social Media Links */}
          {getInTouchCard.contactInformation.socialMedia &&
            getInTouchCard.contactInformation.socialMedia.length > 0 && (
              <div className="pt-4">
                <p className="font-semibold text-gray-700 mb-3">Follow us:</p>
                <div className="flex gap-3">
                  {getInTouchCard.contactInformation.socialMedia.map(
                    (social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-[#548281] text-white flex items-center justify-center hover:bg-[#2F4858] transition-colors"
                      >
                        {getSocialIcon(social.platform)}
                      </a>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-lg">
        <div className="w-12 h-12 rounded-full bg-white border-[3px] border-[#548281] flex items-center justify-center mb-4">
          <Award className="h-6 w-6 text-[#548281]" />
        </div>
        <h3 className="text-2xl font-bold mb-6 text-[#2F4858]">
          {ourCommitmentCard.title}
        </h3>
        <div className="space-y-4 text-lg">
          <p className="text-xl text-gray-700 text-left max-w-4xl mx-auto">
            {ourCommitmentCard.description}
          </p>
        </div>
      </div>
    </div>
  );
}
