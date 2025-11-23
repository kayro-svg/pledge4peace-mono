"use client";

import Turnstile from "react-turnstile";

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (error: any) => void;
  onExpire?: () => void;
  className?: string;
}

export function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  className,
}: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  if (!siteKey) {
    console.error("NEXT_PUBLIC_TURNSTILE_SITE_KEY is not defined");
    return null;
  }

  return (
    <div className={className}>
      <Turnstile
        sitekey={siteKey}
        onVerify={onVerify}
        onError={onError}
        onExpire={onExpire}
        theme="light"
      />
    </div>
  );
}
