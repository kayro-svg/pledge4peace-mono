"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, FileText, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TermsAndConditionsPage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="inline-flex items-center text-[#548281] hover:text-[#3c6665] mb-4 border-none hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back
          </Button>

          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="h-8 w-8 text-[#548281]" />
              <h1 className="text-3xl font-bold text-gray-900">
                Terms and Conditions
              </h1>
            </div>

            <p className="text-gray-600 mb-6">Last updated: June 10, 2025</p>

            <div className="bg-blue-50 border-l-4 border-[#548281] p-4 mb-8">
              <p className="text-sm text-gray-700">
                Please read these terms and conditions carefully before using
                our website. By accessing or using Pledge4Peace.org, you agree
                to be legally bound by these terms.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Table of Contents
              </h2>
              <ul className="space-y-2">
                {[
                  { id: "welcome", title: "1. Welcome to Pledge4Peace.org" },
                  { id: "eligibility", title: "2. Eligibility" },
                  { id: "pledges", title: "3. Nature of Pledges" },
                  { id: "legal", title: "4. No Legal Obligation" },
                  { id: "conduct", title: "5. User Conduct" },
                  { id: "privacy", title: "6. Privacy Policy" },
                  { id: "liability", title: "7. Limitation of Liability" },
                  { id: "indemnification", title: "8. Indemnification" },
                  { id: "intellectual", title: "9. Intellectual Property" },
                  { id: "termination", title: "10. Termination" },
                  { id: "governing", title: "11. Governing Law" },
                  { id: "changes", title: "12. Changes to Terms" },
                  { id: "contact", title: "13. Contact Information" },
                ].map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      className="text-[#548281] hover:text-[#3c6665] hover:underline flex items-center"
                    >
                      <ChevronDown className="h-3 w-3 mr-2" />
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            <section id="welcome" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                1. Welcome to Pledge4Peace.org
              </h2>
              <p className="text-gray-700">
                Welcome to Pledge4Peace.org. By accessing or using our website,
                you agree to comply with and be bound by the following terms and
                conditions. Please read them carefully.
              </p>
            </section>

            <section id="eligibility" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                2. Eligibility
              </h2>
              <p className="text-gray-700">
                To use Pledge4Peace.org, you must be at least 18 years old and
                capable of entering into a legally binding agreement.
              </p>
            </section>

            <section id="pledges" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                3. Nature of Pledges
              </h2>
              <p className="text-gray-700">
                All pledges made on Pledge4Peace.org are purely voluntary and
                non-binding. Pledge4Peace.org does not guarantee or promise any
                specific outcomes, investments, or contributions resulting from
                pledges made on the platform.
              </p>
            </section>

            <section id="legal" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                4. No Legal Obligation
              </h2>
              <p className="text-gray-700">
                Pledge4Peace.org and its affiliates are not legally obligated to
                fulfill any pledges made by users. By making a pledge, you
                acknowledge that it is a statement of intent and not a legally
                enforceable promise. Pledge4Peace.org reserves the right to
                modify or cancel any pledge at any time without notice.
              </p>
            </section>

            <section id="conduct" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                5. User Conduct
              </h2>
              <p className="text-gray-700">
                You agree to use Pledge4Peace.org in accordance with all
                applicable laws and regulations. You must not use the site for
                any unlawful or prohibited activities.
              </p>
            </section>

            <section id="privacy" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                6. Privacy Policy
              </h2>
              <p className="text-gray-700">
                We respect your privacy and are committed to protecting your
                personal information. Our Privacy Policy explains how we
                collect, use, and safeguard your information.
              </p>
            </section>

            <section id="liability" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                7. Limitation of Liability
              </h2>
              <p className="text-gray-700">
                Pledge4Peace.org, its directors, employees, or affiliates shall
                not be liable for any direct, indirect, incidental, special, or
                consequential damages resulting from the use or inability to use
                the site, including but not limited to any loss of profits,
                data, or other intangible losses.
              </p>
            </section>

            <section id="indemnification" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                8. Indemnification
              </h2>
              <p className="text-gray-700">
                You agree to indemnify and hold harmless Pledge4Peace.org and
                its affiliates from any claims, damages, losses, liabilities,
                and expenses arising from your use of the website or violation
                of these terms.
              </p>
            </section>

            <section id="intellectual" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                9. Intellectual Property
              </h2>
              <p className="text-gray-700">
                All content on Pledge4Peace.org, including text, graphics,
                logos, and software, is the property of Pledge4Peace.org and is
                protected by applicable intellectual property laws.
              </p>
            </section>

            <section id="termination" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                10. Termination
              </h2>
              <p className="text-gray-700">
                Pledge4Peace.org reserves the right to terminate or suspend your
                access to the site at any time, without notice, for any reason,
                including violation of these terms.
              </p>
            </section>

            <section id="governing" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                11. Governing Law
              </h2>
              <p className="text-gray-700">
                These terms and conditions are governed by and construed in
                accordance with the laws of New Jersey, United States, without
                regard to its conflict of law principles.
              </p>
            </section>

            <section id="changes" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                12. Changes to Terms
              </h2>
              <p className="text-gray-700">
                Pledge4Peace.org may update these terms and conditions at any
                time. Your continued use of the site after any changes
                constitutes your acceptance of the new terms.
              </p>
            </section>

            <section id="contact" className="scroll-mt-20">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                13. Contact Information
              </h2>
              <p className="text-gray-700">
                If you have any questions or concerns about these terms and
                conditions, please contact us at{" "}
                <a
                  href="mailto:info@pledge4peace.org"
                  className="text-[#548281] hover:text-[#3c6665] hover:underline"
                >
                  info@pledge4peace.org
                </a>
              </p>
            </section>

            {/* <div className="border-t border-gray-200 pt-8 mt-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-start space-x-3 mb-4">
                  <Checkbox
                    id="terms"
                    checked={accepted}
                    onCheckedChange={(checked) =>
                      setAccepted(checked as boolean)
                    }
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    By using Pledge4Peace.org, I acknowledge that I have read,
                    understood, and agree to be bound by these terms and
                    conditions.
                  </label>
                </div>

                <Button disabled={!accepted} className="w-full sm:w-auto">
                  Accept Terms and Conditions
                </Button>
              </div>
            </div> */}

            <div className="text-center text-sm text-gray-500 pt-6">
              <p>© 2025 Pledge4Peace.org. All rights reserved.</p>
              <div className="mt-2 flex justify-center space-x-4">
                <Link
                  href="/contact"
                  className="text-[#548281] hover:text-[#3c6665] hover:underline"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
