import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function PartnerWithUs() {
  return (
    <section className="py-16 px-4 bg-white" id="partnerships">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-[#2F4858] mb-6">
              Partner with Us
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              We invite local organizations, companies, and individuals in our
              focus areas to partner with us. Local representatives can uniquely
              influence decision-makers in their regions to embrace our peace
              plan. We offer attractive partnership opportunities to those who
              share our vision.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[#F5F7EB] p-4 rounded-lg">
                <h3 className="font-bold text-[#2F4858] text-xl mb-2">
                  Local Impact
                </h3>
                <p className="text-sm text-gray-600">
                  Partner with us to create meaningful change in your local
                  community.
                </p>
              </div>
              <div className="bg-[#F5F7EB] p-4 rounded-lg">
                <h3 className="font-bold text-[#2F4858] text-xl mb-2">
                  Global Reach
                </h3>
                <p className="text-sm text-gray-600">
                  Join our global network of peace advocates working for lasting
                  change.
                </p>
              </div>
              <div className="bg-[#F5F7EB] p-4 rounded-lg">
                <h3 className="font-bold text-[#2F4858] text-xl mb-2">
                  Resources
                </h3>
                <p className="text-sm text-gray-600">
                  Access training, materials, and support for your peace
                  initiatives.
                </p>
              </div>
              <div className="bg-[#F5F7EB] p-4 rounded-lg">
                <h3 className="font-bold text-[#2F4858] text-xl mb-2">
                  Recognition
                </h3>
                <p className="text-sm text-gray-600">
                  Be recognized as a leader in the global peace movement.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-[#86AC9D] hover:bg-[#2F4858] hover:text-white text-[#86AC9D]"
            >
              Become a Partner
            </Button>
          </div>
          <div className="md:w-1/2 relative h-[300px] w-full">
            <Image
              src="/placeholder.svg?height=400&width=600&text=Partnership+Opportunities"
              alt="Partnership opportunities"
              className="rounded-lg object-cover"
              fill
            />
          </div>
        </div>
      </div>
    </section>
  );
}
