"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AuthContainer from "@/components/login/auth-container";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";

interface HeroPeaceSealProps {
  data: any;
}

export default function HeroPeaceSeal({ data }: HeroPeaceSealProps) {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated } = useAuthSession();

  return (
    <>
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
            <source src={data?.heroVideo?.asset.url} type="video/webm" />
          </video>
          <div
            className="absolute inset-0
     bg-[linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,.99)_50%,transparent_70%)] md:bg-[linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,.95)_40%,transparent_75%)]"
          />
        </div>

        <div className="max-w-7xl">
          <div className="w-fit rounded-full bg-white/10 px-3 py-1 sm:px-4 backdrop-blur text-xs font-medium tracking-wide text-white">
            {/* Pro-Peace. Pro-Business. */}
            {data?.heroTagline}
          </div>
          <div className="flex flex-col gap-0">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mt-3 sm:mt-4">
              {data?.heroHeading}
            </h1>
            <p className="mt-2 max-w-xl text-white/90 text-xs lg:text-sm leading-relaxed">
              {data?.heroSubheading}
            </p>
          </div>
          <div className="w-1/3 sm:w-1/4 h-1 bg-[#86AC9D] mt-3 sm:mt-4 rounded-full" />
          <p className="mt-3 sm:mt-4 max-w-[35ch] sm:max-w-sm md:max-w-xl text-white/90 text-base md:text-lg leading-snug sm:leading-relaxed">
            {data?.heroDescription}
          </p>

          <div className="mt-5 sm:mt-6">
            <Button
              className="inline-flex items-center rounded-full bg-[#548281] hover:bg-[#2F4858] text-white px-5 sm:px-6 py-3 text-sm sm:text-base"
              onClick={() => {
                if (isAuthenticated) {
                  router.push("/peace-seal/apply");
                } else {
                  setShowLoginModal(true);
                }
              }}
            >
              {data?.heroPrimaryButtonText}
              <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          <div className="flex flex-row gap-4 mt-5">
            <Image
              src="/images/ps-badge-1.png"
              alt="Peace Seal Badge 1"
              width={60}
              height={60}
            />
            <Image
              src="/images/ps-badge-2.png"
              alt="Peace Seal Badge 2"
              width={60}
              height={60}
            />
            <Image
              src="/images/ps-badge-3.png"
              alt="Peace Seal Badge 3"
              width={60}
              height={60}
            />
          </div>
        </div>
      </section>

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="max-w-lg w-full h-[80vh] md:h-[fit-content]">
          <DialogHeader>
            <DialogTitle>
              <p className="text-lg font-semibold mb-4 text-center">
                To apply for a Peace Seal you must login
              </p>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <AuthContainer
              onLoginSuccess={() => {
                setShowLoginModal(false);
                router.push("/peace-seal/apply");
              }}
              isModal
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
