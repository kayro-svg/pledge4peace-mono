"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Users, Award } from "lucide-react";

export function AudiencePathways() {
  const router = useRouter();

  return (
    <section id="audience-pathways" className="w-full py-16">
      <div className="grid md:grid-cols-2">
        {/* Activists Side */}
        <Link
          href="/campaigns"
          className="group relative bg-[#548281] p-10 md:p-16 min-h-[320px] flex flex-col justify-center hover:bg-[#2F4858]  transition-colors duration-300"
        >
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-6 h-6 text-white" />
              <span className="text-sm font-medium uppercase tracking-wider text-white">
                For Activists
              </span>
            </div>

            <h3 className="text-3xl md:text-4xl font-semibold text-white mb-4">
              Take Action Today
            </h3>

            <p className="text-white leading-relaxed mb-6">
              Join global campaigns, sign pledges for peace, and stand alongside
              millions working toward a better world.
            </p>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                document.getElementById("projects-section")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              className="flex items-center group-hover:text-[#8dc6bf] text-white font-medium gap-2 group-hover:gap-3 transition-all duration-300 w-fit"
            >
              <span>View Campaigns</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </Link>

        {/* Businesses Side */}
        <Link
          href="/peace-seal"
          className="group relative bg-[#faf8f4] p-10 md:p-16 min-h-[320px] flex flex-col justify-center hover:bg-[#f5f3ee] transition-colors duration-300"
        >
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-6 h-6 text-[#3d7a73]" />
              <span className="text-sm font-medium uppercase tracking-wider text-[#3d7a73]">
                For Businesses
              </span>
            </div>

            <h3 className="text-3xl md:text-4xl font-semibold text-[#1e3a34] mb-4">
              Register Your Business
            </h3>

            <p className="text-[#5a6b68] leading-relaxed mb-6">
              Earn the Peace Seal certification and show customers your
              commitment to ethics, peace, and responsible practices.
            </p>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push("/peace-seal");
              }}
              className="flex items-center text-[#3d7a73] font-medium gap-2 group-hover:gap-3 transition-all duration-300 w-fit"
            >
              <span>Get Certified</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </Link>
      </div>
    </section>
  );
}
