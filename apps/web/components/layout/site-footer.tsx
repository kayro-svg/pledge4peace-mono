import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import xIcon from "@/public/x.svg";
import instagramIcon from "@/public/ig.svg";
import linkedinIcon from "@/public/lnkdn.svg";
import youtubeIcon from "@/public/yt.svg";

export default function SiteFooter() {
  return (
    <footer className="bg-[#CCD5AE] text-white py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex flex-col items-start justify-start h-min bg-background rounded-lg p-6 shadow-md gap-4 w-min min-w-[350px] flex-0">
            <Image
              src="/p2p_footer_logo.png"
              alt="Pledge4Peace.org"
              width={200}
              height={40}
              className="h-10 w-auto transition-all duration-300 hover:opacity-80 mb-2"
            />

            <p className="text-[#2F4858] mb-2">
              We stand firm in our belief that peace is possible through
              collective action and commitment.
            </p>
          </div>
          <div className="flex justify-between w-full flex-1 gap-6">
            <div className="flex gap-4 justify-evenly w-full">
              <FooterLinks
                title="Company"
                links={[
                  { href: "#", label: "Our Mission" },
                  { href: "#", label: "Leadership" },
                  { href: "#", label: "Careers" },
                  { href: "#", label: "Press" },
                  { href: "#", label: "Blog" },
                ]}
              />

              <FooterLinks
                title="Resources"
                links={[
                  { href: "#", label: "Database" },
                  { href: "#", label: "Research" },
                  { href: "#", label: "Initiatives" },
                  { href: "#", label: "Partners" },
                  { href: "#", label: "FAQ" },
                ]}
              />
            </div>

            <div className="w-full">
              <h4 className="text-lg font-semibold mb-6 text-[#2F4858] flex-0">
                Get in touch
              </h4>
              <div className="flex flex-col gap-4 text-[#2F4858]">
                <address className="flex items-center gap-2 not-italic ">
                  <MapPin className="w-5 h-5 min-w-5 min-h-5" />
                  <p>3392 NY-8, South New Berlin, NY 13843</p>
                </address>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 min-w-5 min-h-5" />
                  <p>info@pledge4peace.org</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 min-w-5 min-h-5" />
                  <p>+1 862-666-1636</p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-[20%]">
            <div className="flex space-x-4 mb-6 items-center">
              <Link href="#">
                <Image src={xIcon} alt="X" width={22} height={22} />
              </Link>
              <Link href="#">
                <Image
                  src={instagramIcon}
                  alt="Instagram"
                  width={24}
                  height={24}
                />
              </Link>
              <Link href="#">
                <Image src={youtubeIcon} alt="Youtube" width={28} height={28} />
              </Link>
              <Link href="#">
                <Image
                  src={linkedinIcon}
                  alt="Linkedin"
                  width={24}
                  height={24}
                />
              </Link>
            </div>
            <address className="not-italic text-[#2F4858]">
              <p>
                501c3 NonProfit Aiming to Solve World’s Biggest Problems Through
                Pledge.
              </p>
              <p>
                Our goal is to address the world’s biggest challenges with a new
                approach where we bring the silent majority from around the
                world to pledge to visit and invest to create peace.
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 mt-12 text-sm text-gray-500">
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
      <h4 className="text-lg font-semibold mb-6 text-[#2F4858]">{title}</h4>
      <ul className="space-y-3">
        {links.map((link, index) => (
          <li key={index}>
            <Link
              href={link.href}
              className="text-[#2F4858] hover:text-[#698D8B] transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
