"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HeaderUser } from "./header-user";
import { HeaderUserMobile } from "./header-user-mobile";
import { useState } from "react";
import {
  Menu,
  X,
  Home,
  Info,
  Heart,
  Mail,
  ChevronRight,
  LayoutDashboardIcon,
} from "lucide-react";
import { Button } from "../ui/button";

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const sessionStatus = sessionResult?.status;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path ? "text-[#548281]" : "text-[#2F4858]";
  };

  const menuItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Info, label: "About", href: "/about" },
    { icon: Heart, label: "Volunteer", href: "/volunteer" },
    { icon: Mail, label: "Contact", href: "/contact" },
  ];

  return (
    <>
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
            {sessionStatus === "loading" ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-full"></div>
            ) : session ? (
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
            className="md:hidden p-2 rounded-md text-[#2F4858] hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Minimalist Mobile Menu */}
      <div
        className={`
          fixed top-0 left-0 h-full w-80 bg-white z-50 shadow-2xl md:hidden
          transform transition-all duration-500 ease-out
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Clean Header */}
        <div className="p-8 border-b border-gray-100">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          <div className="space-y-1 pr-12">
            <Image
              src="/p2p_footer_logo.png"
              alt="Pledge4Peace.org"
              width={160}
              height={32}
              className="h-8 w-auto mb-2"
            />
            <p className="text-sm text-[#698D8B] font-light">
              Creating peace in the world
            </p>
          </div>
        </div>

        {/* Minimal Navigation */}
        <nav className="py-8">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center justify-between px-8 py-4 transition-colors duration-200 group
                    ${
                      pathname === item.href
                        ? "bg-[#548281]/5 text-[#548281] border-r-2 border-[#548281]"
                        : "text-[#2F4858] hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <item.icon
                      className={`h-4 w-4 ${pathname === item.href ? "text-[#548281]" : "text-gray-500"}`}
                    />
                    <span className="font-light">{item.label}</span>
                  </div>
                  <ChevronRight
                    className={`h-4 w-4 transition-opacity ${pathname === item.href ? "opacity-100 text-[#548281]" : "opacity-0 group-hover:opacity-100 text-gray-400"}`}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Clean User/Auth Section */}
        <div className="p-8 border-t border-gray-100">
          {sessionStatus === "loading" ? (
            <div className="space-y-3">
              <div className="w-full h-10 bg-gray-200 animate-pulse rounded-full"></div>
              <div className="w-3/4 h-4 bg-gray-200 animate-pulse rounded mx-auto"></div>
            </div>
          ) : session ? (
            <div className="space-y-4">
              <HeaderUserMobile user={session.user} />
            </div>
          ) : (
            <div className="space-y-4">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium bg-[#548281] text-white hover:bg-[#2f4858] transition-colors duration-300 ease-in-out focus:outline-none shadow-sm"
              >
                LOGIN
              </Link>
              <p className="text-xs text-center text-gray-500 font-light">
                Join our community for peace
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
