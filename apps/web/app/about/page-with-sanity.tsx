// app/about/page-with-sanity.tsx
// This is an example implementation showing how to use Sanity data
// Replace the original page.tsx with this implementation after testing

import Image from "next/image";
import { ArrowRight, Mail, Phone, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAboutPageData } from "@/lib/sanity/queries";
import { getSanityImageUrl, hasSanityImage } from "@/lib/sanity/image-helpers";
import { SanityAboutPage, SanitySocialMedia } from "@/lib/types";

// Social media icons mapping
const socialIcons = {
  facebook: "Facebook",
  twitter: "Twitter",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  tiktok: "TikTok",
};

/**
 * Hero Banner Component using Sanity data
 */
function AboutHeroBanner({
  heroSection,
}: {
  heroSection: SanityAboutPage["heroSection"];
}) {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="bg-gradient-to-br from-[#2F4858] via-[#548281] to-[#8BB05C] py-16 md:py-24 px-2 md:px-4 lg:px-8 text-white relative">
        {/* Background image if provided from Sanity */}
        {hasSanityImage(heroSection.heroBgImage) && (
          <div className="absolute inset-0 z-0 opacity-20">
            <Image
              src={getSanityImageUrl(heroSection.heroBgImage, 1920, 1080)}
              alt="About Us Hero Background"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        )}

        <div className="container mx-auto max-w-6xl relative z-10">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-white">
            {heroSection.heroHeading}
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl max-w-3xl text-white/90 mb-8">
            {heroSection.heroSubheading}
          </p>
        </div>

        {/* Curved edge at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#FDFDF0] rounded-t-[50%] z-10"></div>
      </div>
    </div>
  );
}

/**
 * Who We Are Section Component using Sanity data
 */
function WhoWeAreSection({
  whoWeAreSection,
}: {
  whoWeAreSection: SanityAboutPage["whoWeAreSection"];
}) {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2F4858] mb-6">
              {whoWeAreSection.whoWeAreHeading}
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed">
              {whoWeAreSection.whoWeAreFirstParagraph}
            </p>

            <p className="text-lg text-gray-700 leading-relaxed">
              {whoWeAreSection.whoWeAreSecondParagraph}
            </p>

            <p className="text-lg text-gray-700 leading-relaxed">
              {whoWeAreSection.whoWeAreThirdParagraph}
            </p>
          </div>

          {/* Image */}
          {hasSanityImage(whoWeAreSection.whoWeAreImage) && (
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={getSanityImageUrl(whoWeAreSection.whoWeAreImage, 800, 600)}
                alt="Who We Are"
                fill
                style={{ objectFit: "cover" }}
                className="transition-transform hover:scale-105 duration-300"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Mission and Philosophy Sections Component using Sanity data
 */
function MissionPhilosophySection({
  ourMissionSection,
  ourPhilosophySection,
}: {
  ourMissionSection: SanityAboutPage["ourMissionSection"];
  ourPhilosophySection: SanityAboutPage["ourPhilosophySection"];
}) {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl space-y-16">
        {/* Mission Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {hasSanityImage(ourMissionSection.ourMissionImage) && (
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={getSanityImageUrl(
                  ourMissionSection.ourMissionImage,
                  800,
                  600
                )}
                alt="Our Mission"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          )}

          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2F4858] mb-6">
              {ourMissionSection.ourMissionHeading}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {ourMissionSection.ourMissionParagraph}
            </p>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2F4858] mb-6">
              {ourPhilosophySection.ourPhilosophyHeading}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {ourPhilosophySection.ourPhilosophyParagraph}
            </p>
          </div>

          {hasSanityImage(ourPhilosophySection.ourPhilosophyImage) && (
            <div className="lg:order-1 relative h-[400px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={getSanityImageUrl(
                  ourPhilosophySection.ourPhilosophyImage,
                  800,
                  600
                )}
                alt="Our Philosophy"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Charter Section Component using Sanity data
 */
function CharterSection({
  ourCharterSection,
}: {
  ourCharterSection: SanityAboutPage["ourCharterSection"];
}) {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2F4858] mb-6">
          {ourCharterSection.ourCharterHeading}
        </h2>

        <p className="text-lg text-gray-700 leading-relaxed mb-12">
          {ourCharterSection.ourCharterParagraph}
        </p>

        {/* Charter Principles */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ourCharterSection.charterPrinciples.map((principle, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[#2F4858]">
                  {principle.title}
                </h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Highlight Cards Section using Sanity data
 */
function HighlightCardsSection({
  missionHighlightCard,
  ourCommitmentCard,
}: {
  missionHighlightCard: SanityAboutPage["missionHighlightCard"];
  ourCommitmentCard: SanityAboutPage["ourCommitmentCard"];
}) {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Mission Highlight Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-[#2F4858] mb-4">
                {missionHighlightCard.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {missionHighlightCard.description}
              </p>
            </CardContent>
          </Card>

          {/* Commitment Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-[#2F4858] mb-4">
                {ourCommitmentCard.title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {ourCommitmentCard.description}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

/**
 * Contact Information Section using Sanity data
 */
function ContactSection({
  getInTouchCard,
}: {
  getInTouchCard: SanityAboutPage["getInTouchCard"];
}) {
  const contact = getInTouchCard.contactInformation;

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2F4858] mb-12">
          {getInTouchCard.getInTouchHeading}
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Email */}
          {contact.email && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Mail className="h-8 w-8 text-[#548281] mx-auto mb-4" />
                <h3 className="font-semibold text-[#2F4858] mb-2">Email</h3>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-[#548281] hover:underline"
                >
                  {contact.email}
                </a>
              </CardContent>
            </Card>
          )}

          {/* Phone */}
          {contact.phone && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <Phone className="h-8 w-8 text-[#548281] mx-auto mb-4" />
                <h3 className="font-semibold text-[#2F4858] mb-2">Phone</h3>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-[#548281] hover:underline"
                >
                  {contact.phone}
                </a>
              </CardContent>
            </Card>
          )}

          {/* Address */}
          {contact.address && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <MapPin className="h-8 w-8 text-[#548281] mx-auto mb-4" />
                <h3 className="font-semibold text-[#2F4858] mb-2">Address</h3>
                <p className="text-gray-700">{contact.address}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Social Media Links */}
        {contact.socialMedia && contact.socialMedia.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-[#2F4858] mb-6">
              Follow Us
            </h3>
            <div className="flex justify-center gap-4">
              {contact.socialMedia.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#548281] text-white px-4 py-2 rounded-full hover:bg-[#2F4858] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  {socialIcons[social.platform] || social.platform}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Main About Page Component using Sanity CMS data
 * This replaces the hardcoded version with dynamic content from Sanity
 */
export default async function AboutPage() {
  // Fetch all about page data from Sanity CMS
  const aboutData: SanityAboutPage = await getAboutPageData();

  return (
    <main className="min-h-screen bg-[#FDFDF0]">
      {/* Hero Banner Section */}
      <AboutHeroBanner heroSection={aboutData.heroSection} />

      {/* Who We Are Section */}
      <WhoWeAreSection whoWeAreSection={aboutData.whoWeAreSection} />

      {/* Mission and Philosophy Sections */}
      <MissionPhilosophySection
        ourMissionSection={aboutData.ourMissionSection}
        ourPhilosophySection={aboutData.ourPhilosophySection}
      />

      {/* Charter Section */}
      <CharterSection ourCharterSection={aboutData.ourCharterSection} />

      {/* Highlight Cards Section */}
      <HighlightCardsSection
        missionHighlightCard={aboutData.missionHighlightCard}
        ourCommitmentCard={aboutData.ourCommitmentCard}
      />

      {/* Contact Information Section */}
      <ContactSection getInTouchCard={aboutData.getInTouchCard} />
    </main>
  );
}
