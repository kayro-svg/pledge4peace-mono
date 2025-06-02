import Image from "next/image";

interface WhoWeAreProps {
  hasIntroParagraphs: boolean;
  introParagraphs: string[];
}

export default function WhoWeAre({
  hasIntroParagraphs,
  introParagraphs,
}: WhoWeAreProps) {
  const firstParagraph = introParagraphs[0];
  const secondParagraph = introParagraphs[1];
  const thirdParagraph = introParagraphs[2];

  return (
    <section className="container mx-auto px-4 max-w-6xl py-4 md:py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-[#2F4858]">
          Who <span className="text-[#548281]">We Are</span>
        </h2>
      </div>
      {/* Intro Paragraphs */}
      {hasIntroParagraphs && introParagraphs.length > 0 && (
        <div className="flex flex-col gap-8">
          {firstParagraph && (
            <p className="text-lg text-gray-700">{firstParagraph}</p>
          )}
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-full md:w-1/2">
              <div className="relative rounded-3xl w-full h-[300px] md:h-[350px] lg:h-[450px] overflow-hidden shadow-lg">
                <Image
                  src="/placeholder.svg?height=500&width=500"
                  alt="About Pledge4Peace"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 space-y-6">
              {secondParagraph && (
                <p className="text-lg text-gray-700">{secondParagraph}</p>
              )}
            </div>
          </div>
          {thirdParagraph && (
            <p className="text-lg text-gray-700">{thirdParagraph}</p>
          )}
        </div>
      )}
    </section>
  );
}
