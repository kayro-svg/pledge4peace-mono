import { Users, Award, Globe } from "lucide-react";

export default function ImpactStats() {
  return (
    <div className="my-24 py-16 px-8 bg-gradient-to-r from-[#2F4858] to-[#548281] rounded-3xl shadow-xl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-white">Our Impact</h2>
        <p className="text-white/80 mt-2">Making a difference globally</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/10 rounded-2xl p-6 text-center border border-white/20">
          <div className="bg-white/20 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-white" />
          </div>
          <span className="text-4xl font-bold text-white">5,000+</span>
          <p className="text-white/80 mt-2">Peace Activists</p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 text-center border border-white/20">
          <div className="bg-white/20 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
            <Award className="h-8 w-8 text-white" />
          </div>
          <span className="text-4xl font-bold text-white">100+</span>
          <p className="text-white/80 mt-2">Political Parties</p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6 text-center border border-white/20">
          <div className="bg-white/20 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <span className="text-4xl font-bold text-white">100,000+</span>
          <p className="text-white/80 mt-2">Pledges Made</p>
        </div>
      </div>
    </div>
  );
}
