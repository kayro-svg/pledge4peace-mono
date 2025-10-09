"use client";

import Script from "next/script";

type Props = { projectId?: string };

export function MicrosoftClarity({
  projectId = process.env.NEXT_PUBLIC_CLARITY_ID,
}: Props) {
  // Do nothing without an ID or outside production
  if (!projectId || process.env.NODE_ENV !== "production") return null;

  return (
    <Script
      id="ms-clarity"
      strategy="afterInteractive"
      src={`https://www.clarity.ms/tag/${projectId}`}
    >
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "${projectId}");`}
    </Script>
  );
}
