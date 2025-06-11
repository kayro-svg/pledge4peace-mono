"use client";

import AuthContainer from "@/components/login/auth-container";
import { LeftPanel } from "@/components/login/left-panel";
import { RightPanel } from "@/components/login/right-panel";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col p-4 pl-[20px] gap-4">
      <div className="">
        <Button
          variant="outline"
          className="border-[#548281] hover:bg-[#2F4858] hover:text-white text-[#548281]"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Go back
        </Button>
      </div>
      <div className="flex flex-col lg:flex-row min-h-full lg:min-h-[calc(100vh-100px)] w-full ">
        <LeftPanel />
        <RightPanel>
          <AuthContainer />
        </RightPanel>
      </div>
    </main>
  );
}
