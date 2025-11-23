"use client";

import { useState } from "react";
import LoginForm from "./login-form";
import RegisterForm from "./register-form";
import { LogoHeader } from "./logo-header";

interface AuthContainerProps {
  onLoginSuccess?: () => void;
  isModal?: boolean;
  isLogin?: boolean;
  preSelectedUserType?: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

export default function AuthContainer({
  onLoginSuccess,
  isModal,
  isLogin = false,
  preSelectedUserType,
  onLoadingChange,
}: AuthContainerProps) {
  const [isLoginView, setIsLoginView] = useState(isLogin);
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitchToRegister = () => {
    setIsLoginView(false);
  };

  const handleSwitchToLogin = () => {
    setIsLoginView(true);
  };

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
    onLoadingChange?.(loading);
  };

  return (
    <div
      className={`w-full max-w-lg items-center justify-center pl-0 ${
        isModal ? "md:pl-0" : "md:pl-[20px]"
      }`}
    >
      <LogoHeader />
      {isLoginView ? (
        <LoginForm
          onSwitchToRegister={handleSwitchToRegister}
          onLoginSuccess={onLoginSuccess}
          onLoadingChange={handleLoadingChange}
        />
      ) : (
        <RegisterForm
          onSwitchToLogin={handleSwitchToLogin}
          isModal={isModal}
          onRegisterSuccess={onLoginSuccess}
          preSelectedUserType={preSelectedUserType}
          onLoadingChange={handleLoadingChange}
        />
      )}
    </div>
  );
}
