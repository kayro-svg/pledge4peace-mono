import HeroPeaceSeal from "@/components/peace-seal/hero-peace-seal/hero-peace-seal";
import { ScrollToSectionButton } from "@/components/peace-seal/scroll-to-section-button";
import { VideoPlayerWithOverlay } from "@/components/peace-seal/video-player-with-overlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPeaceSealHomePage } from "@/lib/sanity/queries";
import { ArrowRight, Check } from "lucide-react";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";

export const dynamic = "force-static";
export const revalidate = 1800;
export const dynamicParams = true;

const getPeaceSealHomePageCached = unstable_cache(
  async (locale: "en" | "es") => getPeaceSealHomePage(locale),
  (locale) => [`peaceSealHomePage:${locale}`],
  { revalidate: 1800 }
);

export default async function PeaceSealPage(params: { locale: "en" | "es" }) {
  const { locale } = params;
  const data = await getPeaceSealHomePageCached(locale);

  const perksDummyData = [
    // Global Spotlight
    {
      number: "01",
      icon: data?.perks[0]?.icon?.asset?.url,
      title: data?.perks[0]?.label,
      description: "Featured placement in the Peace Seal Global Directory",
    },
    //Peace Seal Badge & Certificate
    {
      number: "02",
      icon: data?.perks[1]?.icon?.asset?.url,
      title: data?.perks[1]?.label,
      description: "Display your commitment proudly",
    },
    //Peace Business Network Access
    {
      number: "03",
      icon: data?.perks[2]?.icon?.asset?.url,
      title: data?.perks[2]?.label,
      description: "Connect with like-minded organizations",
    },
    //Investor Visibility
    {
      number: "04",
      icon: data?.perks[3]?.icon?.asset?.url,
      title: data?.perks[3]?.label,
      description: "Attract impact-focused investors",
    },
    //Advisors & Coaching
    {
      number: "05",
      icon: data?.perks[4]?.icon?.asset?.url,
      title: data?.perks[4]?.label || "",
      description: "Access to expert guidance on peace practices",
    },
    // Peace Leadership Awards Eligibility
    {
      number: "06",
      icon: data?.perks[5]?.icon?.asset?.url || "",
      title: data?.perks[5]?.label,
      description: "Eligibility for Peace Leadership Awards",
    },
  ];

  return (
    <main className="min-h-screen w-full text-[#2F4858]">
      {/* ---------- HERO ---------- */}
      <HeroPeaceSeal data={data} />
      {/* ---------- VALUE PROMISE ---------- */}
      <section id="values" className="bg-white pb-5 overflow-visible">
        <div className="mx-auto max-w-7xl justify-center px-4 items-start sm:px-6 lg:px-8 py-12 sm:py-14 md:py-16 flex flex-col lg:flex-row gap-8 lg:gap-8 overflow-visible">
          {/* mini collage / map + photo */}
          <div className="flex relative w-full h-[17rem] lg:h-96 overflow-visible">
            <Image
              src={data.valueImage?.asset.url}
              alt="Global map"
              fill
              className="object-cover overflow-visible"
            />
          </div>

          <div className="flex flex-col justify-center w-full sh-full mt-8 lg:mt-10">
            <h2 className="text-large sm:text-large flex flex-col leading-tight">
              <span className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-0 md:mb-2 text-[#2F4858] leading-tight">
                {data.valueHeadingLines[0].text}
              </span>
              <span className="text-[#86AC9D] text-3xl lg:text-4xl xl:text-5xl font-bold mb-0 md:mb-2 leading-tight">
                {data.valueHeadingLines[1].text}
              </span>
              <span className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-0 md:mb-2 text-[#2F4858] leading-tight">
                {data.valueHeadingLines[2].text}
              </span>
            </h2>
            <div className="w-1/3 sm:w-1/4 h-1 bg-[#86AC9D] mt-3 sm:mt-4 rounded-full" />
            <p className="mt-3 sm:mt-4 text-base leading-relaxed">
              {data.valueParagraph}
            </p>
            <ScrollToSectionButton
              sectionId="what-is"
              className="text-primary p-0 h-auto font-semibold group mt-4 bg-transparent hover:text-[#86AC9D] hover:bg-transparent transition-colors duration-300 flex items-left justify-left w-fit"
            >
              Discover what the Peace Seal means
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </ScrollToSectionButton>
          </div>
        </div>
      </section>

      {/* ---------- WHAT IS ---------- */}
      <section
        id="what-is"
        className="bg-gradient-to-br from-[#F97173]/5 to-[#FDFDF0]"
      >
        <section id="what-is" className="py-20 md:py-28 bg-[#FDFDF0]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                <HighlightPart
                  text={data.whatIsHeadingTop + " " + data.whatIsHeadingMain}
                  part={data.whatIsHeadingMain}
                  className="text-[#86AC9D]"
                />
              </h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto">
                {data.whatIsDescription}
              </p>
            </div>

            {/* Main large video */}
            <div className="max-w-5xl mx-auto mb-12">
              <VideoPlayerWithOverlay
                videoId={data.whatIsVideoId}
                title="Understanding the Peace Seal"
                subtitle="Watch the full video"
                labelsPosition="bottom"
              />
            </div>

            {/* Transition to next section */}
            <div className="text-center bg-card border border-border rounded-2xl p-8 max-w-3xl mx-auto shadow-sm">
              <p className="text-muted-foreground mb-4">
                Now that you understand what the Peace Seal is, discover the
                powerful benefits it brings to your business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ScrollToSectionButton sectionId="why-need" className="group">
                  See Why Your Business Needs It
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </ScrollToSectionButton>
                <ScrollToSectionButton sectionId="rewards" variant="outline">
                  See the Benefits
                </ScrollToSectionButton>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- WHY NEEDS ---------- */}
        <div
          id="why-need"
          className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14 md:py-16"
        >
          <div className="flex flex-col items-center text-center">
            <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-4 leading-tight">
              <HighlightPart
                text={data.whyNeedsTitle}
                part="Business Needs"
                className="text-[#86AC9D]"
              />
            </h3>
            <div className="w-1/4 sm:w-1/6 h-1 bg-[#86AC9D] mt-3 sm:mt-4 rounded-full" />
          </div>

          <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {data.whyNeedsFeatures
              ?.slice(0, 4)
              ?.map((f, i) => (
                <FeatureCard
                  key={i}
                  icon={
                    <Image
                      src={f.icon?.asset?.url || "/placeholder.svg"}
                      alt={f.title}
                      width={35}
                      height={35}
                    />
                  }
                  title={f.title}
                  text={f.text}
                />
              ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Ready to see how simple the process is?
            </p>
            {/* <Button
              onClick={() => scrollToSection("how-it-works")}
              variant="outline"
              className="group"
            >
              Learn How It Works
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button> */}
            <ScrollToSectionButton
              variant="outline"
              sectionId="how-it-works"
              className="group"
            >
              Learn How It Works
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </ScrollToSectionButton>
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section
        id="how-it-works"
        className="bg-gradient-to-bl from-white to-[#A1F971]/10"
      >
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-12 sm:py-14 md:py-16">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-4 leading-tight">
              <HighlightPart
                text={data.howItWorksHeading}
                part="Works"
                className="text-[#86AC9D]"
              />
            </h3>
            <div className="w-1/6 sm:w-1/12 h-1 bg-[#86AC9D] mt-3 sm:mt-4 rounded-full" />
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6">
            <StepCard
              index="01"
              title={data.howItWorksSteps[0].title}
              text={data.howItWorksSteps[0].text}
              icon={
                <Image
                  src={data.howItWorksSteps[0].icon.asset.url}
                  alt={data.howItWorksSteps[0].title}
                  width={35}
                  height={35}
                />
              }
            />
            <StepCard
              index="02"
              title={data.howItWorksSteps[1].title}
              text={data.howItWorksSteps[1].text}
              icon={
                <Image
                  src={data.howItWorksSteps[1].icon.asset.url}
                  alt="Assessment & Audit"
                  width={35}
                  height={35}
                />
              }
            />
            <StepCard
              index="03"
              title={data.howItWorksSteps[2].title}
              text={data.howItWorksSteps[2].text}
              icon={
                <Image
                  src={data.howItWorksSteps[2].icon.asset.url}
                  alt="Earn Your Peace Seal"
                  width={35}
                  height={35}
                />
              }
            />
            <StepCard
              index="04"
              title={data.howItWorksSteps[3].title}
              text={data.howItWorksSteps[3].text}
              icon={
                <Image
                  src={data.howItWorksSteps[3].icon.asset.url}
                  alt="Global Recognition"
                  width={35}
                  height={35}
                />
              }
            />
            <StepCard
              index="05"
              title={data.howItWorksSteps[4].title}
              text={data.howItWorksSteps[4].text}
              icon={
                <Image
                  src={data.howItWorksSteps[4].icon.asset.url}
                  alt="Ongoing Evaluation"
                  width={35}
                  height={35}
                />
              }
            />
          </div>
        </div>
      </section>

      {/* ---------- UNLOCK REWARDS ---------- */}
      <section id="rewards" className="bg-[#FDFDF0] mb-12 gap-0">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-4 leading-tight">
              <HighlightPart
                text={data.rewardsTitle}
                part="Exclusive"
                className="text-[#86AC9D]"
              />
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {data.rewardsDescription}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
            {/* Steps */}
            <div className="space-y-6">
              {perksDummyData.map((perk, index) => (
                <Perk
                  key={index}
                  label={perk.title}
                  icon={
                    <Image
                      src={perk.icon}
                      alt={perk.title}
                      width={35}
                      height={35}
                    />
                  }
                  description={perk.description}
                />
              ))}
            </div>

            {/* Secondary Video - smaller */}
            <div className="lg:sticky lg:top-24">
              <div className="max-w-5xl mx-auto mb-12">
                <VideoPlayerWithOverlay
                  videoId={data.rewardsVideoId}
                  title="The benefits of the Peace Seal"
                  subtitle="Watch the full video"
                  labelsPosition="top"
                />
              </div>

              <p className="text-sm text-muted-foreground mt-4 text-center">
                Watch: The benefits of the Peace Seal explained in 1 minute
              </p>
            </div>
          </div>
        </div>
        <AssessmentCTASection
          title={data.startFreeAssessmentTitle}
          description={data.startFreeAssessmentDescription}
          pros={(data?.startFreeAssessmentPros ?? [])
            .map((x: any) => x?.text)
            .filter(Boolean)}
          buttonText={data.startFreeAssessmentButtonText}
        />
      </section>

      {/* ---------- ADVANTAGE ---------- */}
      <section className="bg-[#FBFBFB] overflow-visible">
        <div className="relative mx-auto px-4 justify-center items-center flex sm:px-6 lg:px-8 py-12 sm:py-14 md:py-16 overflow-visible">
          {/* BG */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-visible">
            <svg
              viewBox="0 0 550 200"
              className="h-full w-full"
              preserveAspectRatio="none"
            >
              <defs>
                <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="20" />
                </filter>
              </defs>

              {/* círculo ancho -> ellipse */}
              <ellipse
                cx="400"
                cy="125"
                rx="170" // ancho
                ry="85" // alto
                fill="#A1F971"
                opacity="0.15"
                filter="url(#blur)"
              />
            </svg>
          </div>

          {/* CONTENIDO */}
          <div className="relative z-10 w-full max-w-6xl">
            <h3 className="text-center text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-4 leading-tight">
              <HighlightPart
                text={data.advantageTitle}
                part="Peace Seal"
                className="text-[#86AC9D]"
              />
            </h3>

            <p className="mt-2 text-center text-base leading-relaxed">
              {data.advantageDescription}
            </p>

            <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="border-2 border-[#ffffff00] shadow-sm rounded-xl hover:border-2 hover:border-rose-400 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg font-bold">
                    {data.withoutTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  {data.withoutItems.map((item, index) => (
                    <BadItem key={index} text={item.text} />
                  ))}
                </CardContent>
              </Card>

              <Card className="border-2 border-[#ffffff00] shadow-sm rounded-xl hover:border-2 hover:border-[#86AC9D] transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg font-bold">
                    {data.withTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  {data.withItems.map((item, index) => (
                    <GoodItem key={index} text={item.text} />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CTA FINAL ---------- */}
      <section className="bg-[#FDFDF0]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14 md:py-16">
          <div className="rounded-xl sm:rounded-2xl bg-[#548281]">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl">
              {/* subtle bubbles */}
              <div className="pointer-events-none absolute inset-0 opacity-30">
                <svg
                  viewBox="0 0 600 200"
                  className="h-full w-full"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <filter
                      id="blur"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feGaussianBlur stdDeviation="20" />
                    </filter>
                  </defs>

                  {/* arriba-izquierda: r1=60 => cx=60, cy=60 */}
                  <circle
                    cx="40"
                    cy="40"
                    r="60"
                    fill="#FFFFFF"
                    filter="url(#blur)"
                  />

                  {/* abajo-derecha: r2=70 => cx=530, cy=130 */}
                  <circle
                    cx="570"
                    cy="170"
                    r="70"
                    fill="#FFFFFF"
                    filter="url(#blur)"
                  />
                </svg>
              </div>

              <div className="relative p-6 sm:p-8 lg:p-12 text-center">
                <h3 className="text-3xl lg:text-4xl xl:text-5xl text-white font-bold mb-2 sm:mb-4 leading-tight">
                  {data.finalCtaTitle}
                </h3>
                <p className="mt-3 max-w-3xl mx-auto text-base leading-relaxed text-white">
                  {data.finalCtaDescription}
                </p>

                <div className="mt-5 sm:mt-6">
                  <Link
                    className="rounded-full inline-flex items-center bg-white hover:bg-[#2F4858] text-[#548281] hover:text-white font-bold px-6 sm:px-8 py-3 text-base transition-all duration-300"
                    href="/peace-seal/apply"
                  >
                    {data.finalCtaButtonText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ---------- Subcomponents ---------- */

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg sm:rounded-xl border border-black/10 bg-white p-4 sm:p-5 shadow-sm">
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="flex justify-center items-center p-2 sm:p-3 rounded-full bg-white border-2 border-[#86AC9D] shrink-0">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-base">{title}</h4>
          <p className="mt-1 text-sm leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}

function StepCard({
  index,
  title,
  text,
  icon,
}: {
  index: string;
  title: string;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    // <div className="relative flex flex-col items-start rounded-lg sm:rounded-xl border border-black/10 bg-white p-4 sm:p-5 shadow-sm">
    <div className="relative flex flex-col items-start rounded-xl border border-black/10 bg-white p-5 shadow-sm md:basis-72 md:shrink-0 w-full lg:min-w-[325px]">
      <div className="w-full flex flex-row items-center justify-between">
        <div className="flex justify-center items-center p-2 rounded-full bg-white border-2 border-[#86AC9D] h-12 w-12 sm:h-16 sm:w-16">
          {icon}
        </div>
        <div className="text-5xl sm:text-7xl font-semibold text-[#FAFAFA]">
          {index}
        </div>
      </div>
      <h4 className="mt-3 sm:mt-4 font-semibold text-base">{title}</h4>
      <p className="mt-1 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

function Perk({
  label,
  icon,
  description,
}: {
  label: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="flex flex-row items-start md:items-center justify-start rounded-lg sm:rounded-xl border border-black/10 bg-white px-2 md:px-4 py-5 md:py-4 text-center text-sm sm:text-base shadow-sm gap-4 h-full md:h-[90px]">
      <div className="flex justify-center items-center p-2 rounded-full bg-white border-2 border-[#86AC9D] h-12 w-12 sm:h-16 sm:w-16 shrink-0">
        {icon}
      </div>

      {/* 2 líneas fijas: xs => 2rem, sm => 2.5rem */}
      <div className="flex flex-col items-start justify-start gap-2">
        <span className="text-lg leading-5 text-start">{label}</span>
        <p className="text-sm text-start">{description}</p>
      </div>
    </div>
  );
}

function BadItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <div className="mt-0.5 grid h-5 w-5 sm:h-6 sm:w-6 place-items-center rounded-full bg-rose-100 shrink-0">
        {/* X icon via svg to mantener neutralidad */}
        <svg
          viewBox="0 0 24 24"
          className="h-3 w-3 sm:h-4 sm:w-4 text-rose-600"
        >
          <path
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M6 6l12 12M18 6l-12 12"
          />
        </svg>
      </div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

function GoodItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <div className="mt-0.5 grid h-5 w-5 sm:h-6 sm:w-6 place-items-center rounded-full bg-emerald-100 shrink-0">
        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-700" />
      </div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

/* ---------- FREE ASSESSMENT CTA (drop-in section) ---------- */
/* ---------- CTA SECTION: FREE ASSESSMENT ---------- */
function AssessmentCTASection({
  title,
  description,
  pros,
  buttonText,
}: {
  title: string;
  description: string;
  pros: string[];
  buttonText: string;
}) {
  return (
    <section
      id="assessment-cta"
      className="bg-[#FDFDF0]"
      aria-label="Free business assessment CTA"
    >
      <div className="mx-auto max-w-6xl lg:px-8 pt-12 sm:pt-14 md:pt-16">
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-black/10 bg-white shadow-sm">
          {/* fondo suave */}
          <div className="hidden md:block pointer-events-none absolute inset-0 opacity-20">
            <svg
              viewBox="0 0 600 200"
              className="h-full w-full"
              preserveAspectRatio="none"
            >
              <defs>
                <filter id="blur" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="20" />
                </filter>
              </defs>
              <circle
                cx="490"
                cy="105"
                r="70"
                fill="#86AC9D"
                filter="url(#blur)"
              />
            </svg>
          </div>

          <div className="relative grid items-center gap-6 sm:gap-8 p-6 sm:p-8 lg:p-10 xl:p-12 lg:grid-cols-[1fr_auto]">
            <div className="w-full lg:w-4/5">
              <div className="inline-block rounded-full bg-[#548281]/10 px-3 py-1 text-xs font-medium text-[#2F4858]">
                Pro-Peace. Pro-Business.
              </div>
              <h3 className="mt-3 text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#2F4858]">
                <HighlightPart
                  text={title}
                  part="FREE"
                  className="text-[#548281]"
                />
              </h3>
              <p className="mt-2 text-sm sm:text-base text-[#2F4858]/80">
                {description}
              </p>

              <ul
                role="list"
                className="mt-3 sm:mt-4 grid gap-2 text-xs sm:text-sm text-[#2F4858]/80"
              >
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-[#548281]" />
                  {pros[0]}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-[#548281]" />
                  {pros[1]}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-[#548281]" />
                  {pros[2]}
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center justify-center lg:items-end gap-2 w-full lg:w-1/2">
              <Link
                className="rounded-full min-w-[155px] inline-flex items-center justify-center bg-[#548281] hover:bg-[#2F4858] text-white px-6 sm:px-8 py-3 text-sm sm:text-base w-full sm:w-auto"
                href="https://www.pledge4peace.org/articles/free-peace-meter"
                target="_blank"
              >
                {buttonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HighlightPart({
  text,
  part,
  className,
}: {
  text: string;
  part: string;
  className?: string;
}) {
  const i = text.indexOf(part);
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <span className={className}>{text.slice(i, i + part.length)}</span>
      {text.slice(i + part.length)}
    </>
  );
}
