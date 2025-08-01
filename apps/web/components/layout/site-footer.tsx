import instagramIcon from "@/public/ig.svg";
import linkedinIcon from "@/public/lnkdn.svg";
import xIcon from "@/public/x.svg";
import tiktokIcon from "@/public/tiktok_icon.svg";
import youtubeIcon from "@/public/yt.svg";
import facebookIcon from "@/public/facebook_icon.svg";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-[#CCD5AE] text-white py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          {/* Logo and mission statement */}
          <div className="flex flex-col items-start justify-start h-min bg-background rounded-lg p-4 sm:p-6 shadow-md gap-4 w-full sm:w-auto sm:min-w-[300px] lg:max-w-[350px] flex-0">
            <Image
              src="/p2p_footer_logo.png"
              alt="Pledge4Peace.org"
              width={200}
              height={40}
              className="h-8 sm:h-10 w-auto transition-all duration-300 hover:opacity-80 mb-2"
            />

            <p className="text-[#2F4858] mb-2 text-sm sm:text-base">
              We stand firm in our belief that peace is possible through
              collective action and commitment.
            </p>
          </div>

          {/* Middle section with links and contact */}
          <div className="flex flex-col sm:flex-row justify-between w-full flex-1 gap-6">
            {/* Links section */}
            <div className="grid grid-cols-2 sm:flex gap-4 sm:gap-6 md:gap-8 justify-evenly w-full">
              <FooterLinks
                title="Site Links"
                links={[
                  { href: "/", label: "Home" },
                  { href: "/about", label: "About Us" },
                  { href: "/volunteer", label: "Volunteer" },
                  { href: "/contact", label: "Contact Us" },
                  {
                    href: "/terms-and-conditions",
                    label: "Terms and Conditions",
                  },
                ]}
              />

              <FooterLinks
                title="Quick Links"
                links={[
                  { href: "/#projects-section", label: "Pledge" },
                  { href: "/volunteer#volunteer-form", label: "Volunteer" },
                  { href: "/articles", label: "Articles & News" },
                  { href: "/events", label: "Events" },
                ]}
              />
            </div>

            {/* Contact info */}
            <div className="w-full sm:w-auto mt-6 sm:mt-0">
              <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-[#2F4858] flex-0">
                Get in touch
              </h4>
              <div className="flex flex-col gap-3 sm:gap-4 text-[#2F4858] text-sm sm:text-base">
                <address className="flex items-center gap-2 not-italic">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 min-w-4 min-h-4 sm:min-w-5 sm:min-h-5" />
                  <p className="text-sm sm:text-base">
                    3392 NY-8, South New Berlin, NY 13843
                  </p>
                </address>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 min-w-4 min-h-4 sm:min-w-5 sm:min-h-5" />
                  <p className="text-sm sm:text-base">info@pledge4peace.org</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 min-w-4 min-h-4 sm:min-w-5 sm:min-h-5" />
                  <p className="text-sm sm:text-base">+1 862-666-1636</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social media and mission */}
          <div className="w-full lg:w-auto lg:max-w-[300px] mt-6 lg:mt-0">
            <div className="flex space-x-4 mb-4 sm:mb-6 items-center">
              <Link
                href="https://www.instagram.com/pledge4peaceorg?igsh=MWxuNXFqZzhnd2g5NA=="
                target="_blank"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src={instagramIcon}
                  alt="Instagram"
                  width={26}
                  height={26}
                  className="w-9 h-9 md:w-8 md:h-8"
                />
              </Link>
              <Link
                href="https://www.tiktok.com/@pledge4peace5?_t=ZT-8xMmpO4sL9x&_r=1"
                target="_blank"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src={tiktokIcon}
                  alt="Tiktok"
                  width={26}
                  height={26}
                  className="w-9 h-9 md:w-8 md:h-8"
                />
              </Link>
              <Link
                href="https://x.com/pledge4peaceorg?s=21&t=F5cL8vzgEmm7vjgbe1oAiw"
                target="_blank"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src={xIcon}
                  alt="X"
                  width={25}
                  height={25}
                  className="w-8 h-8 md:w-7 md:h-7"
                />
              </Link>
              <Link
                href="https://www.facebook.com/share/1F8FxiQ6Hh/?mibextid=wwXIfr"
                target="_blank"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src={facebookIcon}
                  alt="Facebook"
                  width={26}
                  height={26}
                  className="w-8 h-8 md:w-7 md:h-7"
                />
              </Link>
              <Link
                href="https://youtube.com/@pledge4peace?si=d47VEbPcEoU_y-kL"
                target="_blank"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src={youtubeIcon}
                  alt="Youtube"
                  width={26}
                  height={26}
                  className="w-9 h-9 md:w-8 md:h-8"
                />
              </Link>
              {/* <Link href="#" className="hover:opacity-80 transition-opacity">
                <Image
                  src={linkedinIcon}
                  alt="Linkedin"
                  width={22}
                  height={22}
                  className="w-8 h-8 md:w-7 md:h-7"
                />
              </Link> */}
            </div>
            <address className="not-italic text-[#2F4858] text-sm sm:text-base">
              <p className="mb-2">
                501c3 NonProfit Aiming to Solve World&apos;s Biggest Problems
                Through Pledge.
              </p>
              <p>
                Our goal is to address the world&apos;s biggest challenges with
                a new approach where we bring the silent majority from around
                the world to pledge to visit and invest to create peace.
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 sm:pt-8 mt-8 sm:mt-12 text-xs sm:text-sm text-gray-500 text-center sm:text-left">
          <p>&copy; 2025 Pledge4Peace.org. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

interface FooterLinksProps {
  title: string;
  links: Array<{ href: string; label: string }>;
}

function FooterLinks({ title, links }: FooterLinksProps) {
  return (
    <div>
      <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-6 text-[#2F4858]">
        {title}
      </h4>
      <ul className="space-y-2 sm:space-y-3">
        {links.map((link, index) => (
          <li key={index}>
            <Link
              href={link.href}
              className="text-sm sm:text-base text-[#2F4858] hover:text-[#698D8B] transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
