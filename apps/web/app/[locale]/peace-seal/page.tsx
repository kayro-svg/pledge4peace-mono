import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPeaceSealHomePage } from "@/lib/sanity/queries";
import { Check, ChevronRight } from "lucide-react";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import VideoFrame from "@/components/peace-seal/video-frame.lazy";

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

  return (
    <main className="min-h-screen w-full text-[#2F4858]">
      {/* ---------- HERO ---------- */}
      <section
        className="relative overflow-hidden h-[500px] md:h-[600px] flex flex-row justify-start items-end md:items-center px-4 pb-7 md:pb-0 sm:px-6 lg:pl-32"
        aria-label="Hero Peace Seal"
      >
        {/* Background image of Earth */}
        <div className="absolute inset-0 -z-10">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          >
            <source src={data.heroVideo?.asset.url} type="video/webm" />
          </video>
          <div
            className="absolute inset-0
     bg-[linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,.99)_50%,transparent_70%)] md:bg-[linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,.95)_40%,transparent_75%)]"
          />
        </div>

        <div className="max-w-7xl">
          <div className="w-fit rounded-full bg-white/10 px-3 py-1 sm:px-4 backdrop-blur text-xs font-medium tracking-wide text-white">
            {/* Pro-Peace. Pro-Business. */}
            {data.heroTagline}
          </div>
          <div className="flex flex-col gap-0">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mt-3 sm:mt-4">
              {data.heroHeading}
            </h1>
            <p className="mt-2 max-w-xl text-white/90 text-xs lg:text-sm leading-relaxed">
              {data.heroSubheading}
            </p>
          </div>
          <div className="w-1/3 sm:w-1/4 h-1 bg-[#86AC9D] mt-3 sm:mt-4 rounded-full" />
          <p className="mt-3 sm:mt-4 max-w-[35ch] sm:max-w-sm md:max-w-xl text-white/90 text-base md:text-lg leading-snug sm:leading-relaxed">
            {data.heroDescription}
          </p>

          <div className="mt-5 sm:mt-6">
            <Link
              className="inline-flex items-center rounded-full bg-[#548281] hover:bg-[#2F4858] text-white px-5 sm:px-6 py-3 text-sm sm:text-base"
              href={data.heroPrimaryButtonLink}
            >
              {data.heroPrimaryButtonText}
              <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- VALUE PROMISE ---------- */}
      <section className="bg-white pb-5 overflow-visible">
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
          </div>
        </div>
      </section>

      {/* ---------- WHAT IS ---------- */}
      <section className="bg-gradient-to-br from-[#F97173]/5 to-[#FDFDF0]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          <div>
            <p className="text-3xl lg:text-2xl xl:text-3xl font-bold leading-tight">
              {data.whatIsHeadingTop}
            </p>
            <h3 className="text-[#86AC9D] text-4xl xl:text-5xl font-bold mb-2 sm:mb-4 leading-tight">
              {data.whatIsHeadingMain}
            </h3>
            <div className="w-1/3 sm:w-1/4 h-1 bg-[#86AC9D] mt-3 sm:mt-4 rounded-full" />
            <p className="mt-3 sm:mt-4 text-base leading-relaxed">
              {data.whatIsDescription}
            </p>
          </div>

          {/* video mock */}
          <VideoFrame videoId={data.whatIsVideoId} />
        </div>

        {/* ---------- WHY NEEDS ---------- */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14 md:py-16">
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
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="bg-gradient-to-bl from-white to-[#A1F971]/10">
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
      <section className="bg-[#FDFDF0]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-14 md:py-16">
          <h3 className="text-center text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-4 leading-tight">
            <HighlightPart
              text={data.rewardsTitle}
              part="Exclusive"
              className="text-[#86AC9D]"
            />
          </h3>
          <p className="mt-2 text-center text-base leading-relaxed max-w-2xl mx-auto">
            {data.rewardsDescription}
          </p>
          <div className="mt-6 sm:mt-8">
            <VideoFrame videoId={data.rewardsVideoId} />
          </div>
          <div className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <Perk
              label={data.perks[0].label}
              icon={
                <Image
                  src={data.perks[0].icon.asset.url}
                  alt="Global Spotlight"
                  width={35}
                  height={30}
                />
              }
            />
            <Perk
              label={data.perks[1].label}
              icon={
                <Image
                  src={data.perks[1].icon.asset.url}
                  alt="Peace Seal Badge & Certificate"
                  width={35}
                  height={35}
                />
              }
            />
            <Perk
              label={data.perks[2].label}
              icon={
                <Image
                  src={data.perks[2].icon.asset.url}
                  alt="Peace Business Network Access"
                  width={35}
                  height={35}
                />
              }
            />
            <Perk
              label={data.perks[3].label}
              icon={
                <Image
                  src={data.perks[3].icon.asset.url}
                  alt="Investor Visibility"
                  width={35}
                  height={35}
                />
              }
            />
            <Perk
              label={data.perks[4].label}
              icon={
                <Image
                  src={data.perks[4].icon.asset.url}
                  alt="Advisors & Coaching"
                  width={35}
                  height={35}
                />
              }
            />
            <Perk
              label={data.perks[5].label}
              icon={
                <Image
                  src={data.perks[5].icon.asset.url}
                  alt="Peace Events Access Eligibility"
                  width={35}
                  height={35}
                />
              }
            />
          </div>
          <AssessmentCTASection
            title={data.startFreeAssessmentTitle}
            description={data.startFreeAssessmentDescription}
            pros={(data?.startFreeAssessmentPros ?? [])
              .map((x: any) => x?.text)
              .filter(Boolean)}
            buttonText={data.startFreeAssessmentButtonText}
          />
        </div>
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

function Perk({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-black/10 bg-white px-2 sm:px-3 py-3 text-center text-xs sm:text-sm shadow-sm">
      <div className="flex justify-center items-center p-2 rounded-full bg-white border-2 border-[#86AC9D] h-12 w-12 sm:h-16 sm:w-16">
        {icon}
      </div>

      {/* 2 líneas fijas: xs => 2rem, sm => 2.5rem */}
      <div className="flex items-center justify-center h-8 sm:h-10">
        <span className="block max-w-[10rem] sm:max-w-[12rem] text-xs sm:text-sm leading-4 sm:leading-5 text-center line-clamp-2 break-words">
          {label}
        </span>
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
