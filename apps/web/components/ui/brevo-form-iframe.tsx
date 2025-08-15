"use client";

import React, { useEffect, useRef } from "react";

type BrevoFormIframeProps = {
  id: string;
  height?: number;
};

export default function BrevoFormIframe({
  id,
  height = 1100,
}: BrevoFormIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event?.data as any;
      if (!data || data.type !== "brevoFormHeight") return;
      if (data.id !== id) return;
      const newHeight = Number(data.height);
      if (Number.isFinite(newHeight) && iframeRef.current) {
        iframeRef.current.style.height = `${Math.max(newHeight, 400)}px`;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [id]);

  return (
    <iframe
      ref={iframeRef}
      src={`/embeds/brevo/${id}`}
      style={{ width: "100%", height, border: 0 }}
      loading="lazy"
      sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-top-navigation-by-user-activation allow-popups-to-escape-sandbox"
    />
  );
}
