"use client";

import { useState } from "react";
import LoginForm from "./login-form";
import RegisterForm from "./register-form";

interface AuthContainerProps {
  onLoginSuccess?: () => void;
  isModal?: boolean;
}

export default function AuthContainer({
  onLoginSuccess,
  isModal,
}: AuthContainerProps) {
  const [isLoginView, setIsLoginView] = useState(true);

  const handleSwitchToRegister = () => {
    setIsLoginView(false);
  };

  const handleSwitchToLogin = () => {
    setIsLoginView(true);
  };

  return (
    <div className="w-full max-w-md">
      {isLoginView ? (
        <LoginForm
          onSwitchToRegister={handleSwitchToRegister}
          onLoginSuccess={onLoginSuccess}
        />
      ) : (
        <RegisterForm onSwitchToLogin={handleSwitchToLogin} isModal={isModal} />
      )}
    </div>
  );
}
