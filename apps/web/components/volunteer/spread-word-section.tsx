import { Mail, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SpreadWordSection() {
  return (
    <section className="py-16 px-4 bg-[#FDFDF0]" id="spread-word">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2 md:order-2">
            <h2 className="text-3xl font-bold text-[#2F4858] mb-6">
              Spread the Word
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Our approach to resolving these longstanding global issues relies
              on creating momentum to inspire the involved parties to find
              peaceful solutions. Therefore, expanding our reach is vital. You
              can help by:
            </p>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start">
                  <div className="bg-[#D6E0B6] p-2 rounded-lg mr-4">
                    <Mail className="h-6 w-6 text-[#2F4858]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2F4858] text-2xl mb-2">
                      EDDM (Every Door Direct Mail)
                    </h3>
                    <p className="text-gray-600">
                      EDDM is a USPS service that sends postcards to every
                      household in your selected zip code. You can use this{" "}
                      <Link href="#" className="text-[#548281] hover:underline">
                        EDDM service
                      </Link>{" "}
                      or any other EDDM provider to send out postcards to your
                      neighbors.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start">
                  <div className="bg-[#D6E0B6] p-2 rounded-lg mr-4">
                    <Globe className="h-6 w-6 text-[#2F4858]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2F4858] text-2xl mb-2">
                      Encourage Kids to Write Letters
                    </h3>
                    <p className="text-gray-600">
                      Have them create thoughtful messages about peace, make
                      copies, and share them with neighbors.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 md:order-1 relative h-[300px] w-full">
            <Image
              src="/placeholder.svg?height=400&width=600&text=Spreading+The+Message"
              alt="Spreading the message of peace"
              className="rounded-lg object-cover"
              fill
            />
          </div>
        </div>
      </div>
    </section>
  );
}
