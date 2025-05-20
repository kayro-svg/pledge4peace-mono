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
    <div className="container mx-auto px-4 max-w-6xl py-16">
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
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2 p-5">
              <div className="rounded-3xl overflow-hidden shadow-lg">
                <Image
                  src="/images/about-us.jpg"
                  alt="About Pledge4Peace"
                  width={400}
                  height={200}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
            <div className="md:w-1/2 space-y-6">
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
    </div>
  );
}
