"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HeaderUser } from "./header-user";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path ? "text-[#548281]" : "text-[#2F4858]";
  };

  return (
    <header className="w-full py-4 px-4 sm:px-6 flex justify-between items-center border-b sticky top-0 bg-background backdrop-blur-sm z-50 shadow-sm">
      {/* Logo */}
      <div className="flex items-center cursor-pointer">
        <Image
          src="/p2p_footer_logo.png"
          alt="Pledge4Peace.org"
          width={200}
          height={40}
          className="h-8 sm:h-10 w-auto"
          onClick={() => router.push("/")}
        />
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center space-x-8 lg:space-x-16">
        <Link
          href="/"
          className={`text-base lg:text-lg font-medium ${isActive("/")} hover:text-[#698D8B] transition-colors active:text-brand-500`}
        >
          Home
        </Link>
        <Link
          href="/about"
          className={`text-base lg:text-lg font-medium ${isActive("/about")} hover:text-[#698D8B] transition-colors active:text-brand-500`}
        >
          About
        </Link>
        <Link
          href="/volunteer"
          className={`text-base lg:text-lg font-medium ${isActive("/volunteer")} hover:text-[#698D8B] transition-colors active:text-brand-500`}
        >
          Volunteer
        </Link>
        <Link
          href="/contact"
          className={`text-base lg:text-lg font-medium ${isActive("/contact")} hover:text-[#698D8B] transition-colors active:text-brand-500`}
        >
          Contact
        </Link>
      </nav>

      {/* Authentication and Mobile Menu Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Login/User Profile */}
        <div className="hidden sm:block">
          {session ? (
            <HeaderUser user={session.user} />
          ) : (
            <Link
              href="/login"
              className={`tracking-wider inline-flex items-center w-fit justify-center rounded-full px-4 sm:px-5 py-1.5 sm:py-2 text-sm font-bold ${isActive("/login") ? "bg-[#548281] text-white" : "text-[#548281]"} hover:text-white shadow hover:bg-[#2f4858] transition-colors duration-300 ease-in-out focus:outline-none`}
            >
              LOGIN
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md text-[#2F4858] hover:bg-gray-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md z-40 border-b">
          <div className="flex flex-col p-4 space-y-4">
            <Link
              href="/"
              className={`text-lg font-medium ${isActive("/")} hover:text-[#698D8B] transition-colors py-2`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`text-lg font-medium ${isActive("/about")} hover:text-[#698D8B] transition-colors py-2`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/volunteer"
              className={`text-lg font-medium ${isActive("/volunteer")} hover:text-[#698D8B] transition-colors py-2`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Volunteer
            </Link>
            <Link
              href="/contact"
              className={`text-lg font-medium ${isActive("/contact")} hover:text-[#698D8B] transition-colors py-2`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            
            {/* Mobile Login Button */}
            {!session && (
              <Link
                href="/login"
                className={`tracking-wider inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-bold bg-[#548281] text-white hover:bg-[#2f4858] transition-colors duration-300 ease-in-out focus:outline-none w-full sm:hidden`}
                onClick={() => setMobileMenuOpen(false)}
              >
                LOGIN
              </Link>
            )}
            
            {/* Mobile User Profile */}
            {session && (
              <div className="sm:hidden py-2">
                <HeaderUser user={session.user} />
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
