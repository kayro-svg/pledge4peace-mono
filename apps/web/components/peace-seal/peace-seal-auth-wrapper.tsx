"use client";

import { useEffect, useState } from "react";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AuthContainer from "@/components/login/auth-container";
import { useRouter } from "next/navigation";

interface PeaceSealAuthWrapperProps {
  children: React.ReactNode;
}

export default function PeaceSealAuthWrapper({
  children,
}: PeaceSealAuthWrapperProps) {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { isAuthenticated, status } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    // Only show modal if user is not authenticated and not loading
    if (status === "unauthenticated") {
      setShowRegisterModal(true);
    }
  }, [status]);

  const handleLoginSuccess = () => {
    setShowRegisterModal(false);
    // Optionally refresh the page or redirect
    router.refresh();
  };

  return (
    <>
      {children}

      {/* Register Modal */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="max-w-lg w-full h-[80vh] md:h-[fit-content]">
          <DialogHeader>
            <DialogTitle>
              <p className="text-lg font-semibold mb-4 text-center">
                Register to access Peace Seal
              </p>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center">
            <AuthContainer
              onLoginSuccess={handleLoginSuccess}
              isModal
              isLogin={false}
              preSelectedUserType="organization"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
