import SupportImage from "../../public/pledge_impact.png";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

export default function SupportBanner() {
  return (
    // <div
    //   className="relative flex w-full h-[500px] flex-col rounded-2xl bg-cover px-[30px] py-[30px] md:px-[64px] md:py-[56px] justify-end"
    //   style={{
    //     backgroundImage: `url(${SupportImage.src})`,
    //     backgroundSize: "cover",
    //     backgroundPosition: "center",
    //   }}
    // >
    //   <div className="absolute bg-gradient-to-r from-black/90 to-black/10 top-0 right-0 w-full h-full rounded-2xl"></div>
    //   <div className="w-full z-10 ">
    //     <h4 className="mb-[14px] max-w-full text-xl font-bold text-white md:w-[64%] md:text-3xl md:leading-[42px] lg:w-[46%] xl:w-[85%] 2xl:w-[75%] 3xl:w-[52%]">
    //       Impact of your support
    //     </h4>
    //     <p className="mb-[40px] max-w-full text-base font-medium text-white md:w-[64%] lg:w-[40%] xl:w-[72%] 2xl:w-[60%] 3xl:w-[45%]">
    //       Your support has helped us achieve great things.
    //     </p>

    //     <div className="mt-[36px] flex items-center justify-between gap-4 sm:justify-start 2xl:gap-10">
    //       <button className="text-black linear rounded-full bg-white px-4 py-2 text-center text-base font-medium transition duration-200 hover:!bg-white/80 active:!bg-white/70">
    //         View impact
    //       </button>
    //     </div>
    //   </div>
    // </div>
    <div className="relative mb-8 overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-emerald-700/20" />
      <Image
        src={SupportImage.src}
        alt="Children receiving aid"
        width={1200}
        height={400}
        className="h-[300px] w-full object-cover object-center sm:h-[400px]"
      />
      <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
        <div className="max-w-2xl">
          <Badge className="mb-4 bg-emerald-500 text-white hover:bg-emerald-600">
            Impact Report
          </Badge>
          <h2 className="mb-2 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            Impact of your support
          </h2>
          <p className="mb-6 max-w-lg text-lg text-emerald-50">
            Your support has helped us achieve great things. Together,
            we&apos;re making a real difference in communities around the world.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-white text-emerald-800 hover:bg-emerald-50"
            >
              View Impact Report
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10"
            >
              Share Your Impact <Share2 className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
