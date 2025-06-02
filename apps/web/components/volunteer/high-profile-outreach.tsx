import { CheckCircle } from "lucide-react";
import Image from "next/image";

export default function HighProfileOutreach() {
  return (
    <section className="py-16 px-4 bg-white" id="high-profile">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-[#2F4858] mb-6">
              Convince High-Profile Figures to Pledge on Our Site
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              We aim to spread the message of love and peace globally. As a
              volunteer, we encourage you to connect with high-profile
              individuals and ask them to pledge on our site. Reach out to:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-[#548281] mr-2 mt-1 flex-shrink-0" />
                <span>
                  Political figures (Mayors, Congressmen and Congresswomen,
                  Senators, Governors, and other local politicians)
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-[#548281] mr-2 mt-1 flex-shrink-0" />
                <span>
                  Celebrities, sports team players, and representatives
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-[#548281] mr-2 mt-1 flex-shrink-0" />
                <span>Influential community leaders</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-[#548281] mr-2 mt-1 flex-shrink-0" />
                <span>Businesses and organizations</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-[#548281] mr-2 mt-1 flex-shrink-0" />
                <span>Religious leaders</span>
              </li>
            </ul>
          </div>
          <div className="md:w-1/2 relative h-[300px] w-full">
            <Image
              src="/placeholder.svg?height=400&width=600&text=Influential+Figures"
              alt="Influential figures supporting peace"
              className="rounded-lg object-cover"
              fill
            />
          </div>
        </div>
      </div>
    </section>
  );
}
