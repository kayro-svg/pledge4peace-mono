// app/volunteer/page-with-sanity.tsx
// This is an example implementation showing how to use Sanity data for Volunteer page
// Replace the original page.tsx with this implementation after testing

import Image from "next/image";
import { ArrowRight, Users, Megaphone, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getVolunteerPageData } from "@/lib/sanity/queries";
import { getSanityImageUrl, hasSanityImage } from "@/lib/sanity/image-helpers";
import { SanityVolunteerPage } from "@/lib/types";

// Import the client component directly
import InteractiveButton from "./interactive-button";

/**
 * Hero Banner Component using Sanity data
 */
function VolunteerHeroBanner({
  heroSection,
}: {
  heroSection: SanityVolunteerPage["heroSection"];
}) {
  return (
    <section className="py-8 lg:py-16">
      <div className="px-4 mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          {/* Text Content */}
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[#2F4858]">
              {heroSection.heroHeading} hola
            </h1>
            <p className="text-lg mb-8 text-[#2F4858]">
              {heroSection.heroSubheading}
            </p>
            <div className="flex flex-wrap gap-4">
              <InteractiveButton
                text={heroSection.heroButtonText}
                target="#volunteer-form"
                className="bg-[#548281] text-white group"
              />
            </div>
          </div>

          {/* Hero Image */}
          <div className="md:w-1/2 relative h-[300px] md:h-[400px] w-full shadow-[0_0_10px_0_rgba(0,0,0,0.2)] rounded-2xl overflow-hidden">
            {hasSanityImage(heroSection.heroBgImage) ? (
              <Image
                src={getSanityImageUrl(heroSection.heroBgImage, 800, 600)}
                alt="Volunteers making a difference"
                className="object-cover w-full h-full"
                fill
              />
            ) : (
              <Image
                src="/volunteers.png"
                alt="Volunteers making a difference"
                className="object-cover w-full h-full"
                fill
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Ways to Volunteer Section using Sanity data
 */
function WaysToVolunteerSection({
  waysToVolunteerSection,
}: {
  waysToVolunteerSection: SanityVolunteerPage["waysToVolunteerSection"];
}) {
  // Static volunteer ways (can be moved to Sanity later if needed)
  const volunteerWays = [
    {
      icon: <Users className="h-8 w-8 text-[#548281]" />,
      title: "High-Profile Outreach",
      description:
        "Connect with celebrities, politicians, and influential figures to expand our reach and impact.",
      learnMore: "#high-profile",
    },
    {
      icon: <Megaphone className="h-8 w-8 text-[#548281]" />,
      title: "Community Campaigns",
      description:
        "Launch local initiatives that spread our message of peace through neighborhood outreach and engagement.",
      learnMore: "#spread-word",
    },
  ];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#2F4858] mb-6">
            {waysToVolunteerSection.waysToVolunteerHeading}
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            {waysToVolunteerSection.waysToVolunteerParagraph}
          </p>
        </div>

        {/* Volunteer Ways Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {volunteerWays.map((way, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[#548281]/10 rounded-lg">
                    {way.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[#2F4858] mb-3">
                      {way.title}
                    </h3>
                    <p className="text-gray-700 mb-4">{way.description}</p>
                    <a
                      href={way.learnMore}
                      className="text-[#548281] hover:underline font-medium"
                    >
                      Learn More →
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Convince High-Profile Figures Section using Sanity data
 */
function ConvinceHighProfileSection({
  convinceHighProfileSection,
}: {
  convinceHighProfileSection: SanityVolunteerPage["convinceHighProfileSection"];
}) {
  return (
    <section id="high-profile" className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2F4858] mb-6">
              {convinceHighProfileSection.convinceHighProfileHeading}
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {convinceHighProfileSection.convinceHighProfileParagraph}
            </p>

            {/* Checklist */}
            <div className="space-y-4">
              {convinceHighProfileSection.convinceHighProfileChecklist.map(
                (item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-[#548281] flex-shrink-0" />
                    <span className="text-gray-700">{item.title}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Image */}
          {hasSanityImage(
            convinceHighProfileSection.convinceHighProfileImage
          ) && (
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={getSanityImageUrl(
                  convinceHighProfileSection.convinceHighProfileImage,
                  800,
                  600
                )}
                alt="High-Profile Outreach"
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
 * Spread the Word Section using Sanity data
 */
function SpreadTheWordSection({
  spreadTheWordSection,
}: {
  spreadTheWordSection: SanityVolunteerPage["spreadTheWordSection"];
}) {
  return (
    <section id="spread-word" className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          {hasSanityImage(spreadTheWordSection.spreadTheWordImage) && (
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={getSanityImageUrl(
                  spreadTheWordSection.spreadTheWordImage,
                  800,
                  600
                )}
                alt="Spread the Word"
                fill
                style={{ objectFit: "cover" }}
                className="transition-transform hover:scale-105 duration-300"
              />
            </div>
          )}

          {/* Text Content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2F4858] mb-6">
              {spreadTheWordSection.spreadTheWordHeading}
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {spreadTheWordSection.spreadTheWordParagraph}
            </p>

            {/* Spread the Word Cards */}
            <div className="space-y-6">
              {spreadTheWordSection.spreadTheWordCards.map((card, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-[#2F4858] mb-2">
                      {card.title}
                    </h3>
                    <p className="text-gray-700">{card.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Impact Section using Sanity data
 */
function ImpactSection({
  impactSection,
}: {
  impactSection: SanityVolunteerPage["impactSection"];
}) {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-[#2F4858] via-[#548281] to-[#8BB05C] text-white">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {impactSection.impactHeading}
        </h2>

        <p className="text-lg md:text-xl mb-8 text-white/90">
          {impactSection.impactParagraph}
        </p>

        <InteractiveButton
          text={impactSection.impactButtonText}
          target="#volunteer-form"
          className="bg-white text-[#548281] hover:bg-white/90 hover:text-[#2F4858] group rounded-full"
          size="lg"
        />
      </div>
    </section>
  );
}

/**
 * Simple Volunteer Form Component (placeholder)
 */
function VolunteerForm() {
  return (
    <section id="volunteer-form" className="py-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-[#2F4858] mb-6 text-center">
              Join Our Team
            </h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#548281]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#548281]"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#548281]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How would you like to volunteer?
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#548281]"
                  placeholder="Tell us about your interests and skills..."
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#548281] text-white hover:bg-[#2F4858]"
              >
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/**
 * Main Volunteer Page Component using Sanity CMS data
 * This replaces the hardcoded version with dynamic content from Sanity
 */
export default async function VolunteerPageWithSanity() {
  // Fetch all volunteer page data from Sanity CMS
  const volunteerData: SanityVolunteerPage = await getVolunteerPageData();

  return (
    <div className="min-h-screen">
      {/* Hero Banner Section */}
      <VolunteerHeroBanner heroSection={volunteerData.heroSection} />

      {/* Ways to Volunteer Section */}
      <WaysToVolunteerSection
        waysToVolunteerSection={volunteerData.waysToVolunteerSection}
      />

      {/* Convince High-Profile Figures Section */}
      <ConvinceHighProfileSection
        convinceHighProfileSection={volunteerData.convinceHighProfileSection}
      />

      {/* Spread the Word Section */}
      <SpreadTheWordSection
        spreadTheWordSection={volunteerData.spreadTheWordSection}
      />

      {/* Impact Section */}
      <ImpactSection impactSection={volunteerData.impactSection} />

      {/* Volunteer Form */}
      <VolunteerForm />
    </div>
  );
}
