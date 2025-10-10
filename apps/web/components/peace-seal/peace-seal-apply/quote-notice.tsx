// QuoteNotice.tsx
"use client";

import { useTransition } from "react";
import { TriangleAlert, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  onRequestQuote: () => void; // e.g. () => setStep(1)
  className?: string;
};

export function QuoteNotice({ onRequestQuote, className = "" }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <section
      aria-labelledby="quote-title"
      aria-describedby="quote-desc"
      aria-busy={pending}
      role="status"
      className={`mx-auto w-full max-w-2xl rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <TriangleAlert
          aria-hidden="true"
          className="mt-0.5 h-5 w-5 text-yellow-700"
        />
        <div className="min-w-0 flex-1">
          <h3
            id="quote-title"
            className="text-sm font-semibold text-yellow-900"
          >
            Custom quote required for 50+ employees
          </h3>
          <p id="quote-desc" className="mt-1 text-sm text-yellow-900/90">
            Your company appears to have over 50 employees. Send a quote request
            to proceed. You can continue the application by completing the
            questionnaire after submitting the request.
          </p>
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              onClick={() => startTransition(onRequestQuote)}
              disabled={pending}
              className="w-full sm:w-auto"
            >
              {pending ? (
                <>
                  <Loader2
                    aria-hidden="true"
                    className="mr-2 h-4 w-4 animate-spin"
                  />
                  Sending…
                </>
              ) : (
                "Request custom quote"
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// // QuoteNotice.tsx
// "use client";

// import { TriangleAlert } from "lucide-react";
// import { Button } from "@/components/ui/button";

// type Props = {
//   onRequestQuote: () => void; // e.g. () => setStep(1)
//   className?: string;
// };

// export function QuoteNotice({ onRequestQuote, className = "" }: Props) {
//   return (
//     <section
//       role="status"
//       aria-live="polite"
//       className={`mx-auto w-full max-w-2xl rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm ${className}`}
//     >
//       <div className="flex items-start gap-3">
//         <TriangleAlert
//           aria-hidden="true"
//           className="mt-0.5 h-5 w-5 text-yellow-700"
//         />
//         <div className="min-w-0 flex-1">
//           <h3
//             id="quote-title"
//             className="text-sm font-semibold text-yellow-900"
//           >
//             A custom quote is recommended
//           </h3>
//           <p className="mt-1 text-sm text-yellow-900/90">
//             Your company has more than 50 employees. Request a quote and we will
//             get back to you soon. After you request a quote, you can continue
//             with the application by filling out the questionnaire.
//           </p>
//           <div className="mt-3 flex justify-end">
//             <Button onClick={onRequestQuote} className="w-full sm:w-auto">
//               Request a quote
//             </Button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }
