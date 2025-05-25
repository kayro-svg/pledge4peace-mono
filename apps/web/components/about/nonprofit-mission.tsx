import { Button } from "@/components/ui/button";

export default function NonprofitMission() {
  return (
    <div className="my-20 bg-white p-12 rounded-3xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#2F4858]">
          Our <span className="text-[#548281]">Mission</span>
        </h2>
        <div className="w-20 h-1 bg-[#548281] mx-auto mt-4 mb-8"></div>
      </div>

      <p className="text-xl text-gray-700 text-center max-w-4xl mx-auto">
        Our goal is to address the world's biggest challenges with a new
        approach where we bring the silent majority from around the world to
        pledge to visit and invest to create peace.
      </p>
      {/* 
      <div className="mt-8 text-center">
        <Button className="bg-[#548281] text-white hover:bg-[#2F4858] py-3 px-10 text-lg">
          Make a Pledge for Peace
        </Button>
      </div> */}
    </div>
  );
}
