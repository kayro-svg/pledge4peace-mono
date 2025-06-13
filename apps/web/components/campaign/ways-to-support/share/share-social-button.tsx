"use client";

import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Share as ShareIcon,
  MessageCircle,
  Mail,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { logger } from "@/lib/utils/logger";
import { toast } from "sonner";
import React from "react";

export interface ShareData {
  title: string;
  text: string;
  url: string;
  hashtags?: string;
}

interface ShareButtonProps {
  shareData: ShareData | undefined;
  className?: string;
}

interface SocialPlatform {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  getShareUrl?: () => string;
  onClick?: () => void | Promise<void>;
}

// Helper function to detect mobile devices
const isMobileDevice = () => {
  if (typeof window === "undefined") return false;

  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    window.innerWidth <= 768 ||
    "ontouchstart" in window
  );
};

// Helper function to check if Web Share API is available
const isWebShareSupported = () => {
  return typeof navigator !== "undefined" && "share" in navigator;
};

const getSocialPlatforms = (
  shareData: ShareData | undefined,
  isLinkCopied: boolean,
  setIsLinkCopied: (value: boolean) => void
): SocialPlatform[] => [
  {
    name: "WhatsApp",
    icon: MessageCircle,
    color: "text-[#25D366]",
    getShareUrl: () => {
      const text = encodeURIComponent(
        `${shareData?.text || shareData?.title || ""} ${shareData?.url || ""}`
      );
      return `https://wa.me/?text=${text}`;
    },
  },
  {
    name: "Facebook",
    icon: Facebook,
    color: "text-[#1877F2]",
    getShareUrl: () =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData?.url || "")}&quote=${encodeURIComponent(shareData?.text || "")}`,
  },
  {
    name: "X (Twitter)",
    icon: Twitter,
    color: "text-black",
    getShareUrl: () => {
      const text = encodeURIComponent(shareData?.text || "");
      const url = encodeURIComponent(shareData?.url || "");
      const hashtags = shareData?.hashtags
        ? `&hashtags=${shareData.hashtags}`
        : "";
      return `https://twitter.com/intent/tweet?text=${text}&url=${url}${hashtags}`;
    },
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-[#0A66C2]",
    getShareUrl: () =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData?.url || "")}`,
  },
  {
    name: "Email",
    icon: Mail,
    color: "text-gray-600",
    getShareUrl: () => {
      const subject = encodeURIComponent(shareData?.title || "");
      const body = encodeURIComponent(
        `${shareData?.text || ""}\n\n${shareData?.url || ""}`
      );
      return `mailto:?subject=${subject}&body=${body}`;
    },
  },
  {
    name: isLinkCopied ? "Link Copied!" : "Copy Link",
    icon: isLinkCopied ? Check : LinkIcon,
    color: isLinkCopied ? "text-green-600" : "text-gray-600",
    onClick: async () => {
      await copyToClipboard(shareData?.url || "", setIsLinkCopied);
    },
  },
];

const copyToClipboard = async (
  text: string,
  setIsLinkCopied: (value: boolean) => void
) => {
  if (typeof window === "undefined") return false;

  try {
    await navigator.clipboard.writeText(text);
    setIsLinkCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setIsLinkCopied(false), 3000);
    return true;
  } catch (err) {
    logger.error("Failed to copy text:", err);
    // Fallback for older browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setIsLinkCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setIsLinkCopied(false), 3000);
      return true;
    } catch (fallbackErr) {
      logger.error("Fallback copy failed:", fallbackErr);
      toast.error("Failed to copy link");
      return false;
    }
  }
};

export function ShareSocialButton({
  shareData,
  className = "",
}: ShareButtonProps) {
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [webShareSupported, setWebShareSupported] = useState(false);

  const socialPlatforms = getSocialPlatforms(
    shareData,
    isLinkCopied,
    setIsLinkCopied
  );

  // Detect mobile and Web Share API support on client side
  useEffect(() => {
    setIsMobile(isMobileDevice());
    setWebShareSupported(isWebShareSupported());
  }, []);

  const handleNativeShare = async () => {
    if (webShareSupported && shareData) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        });
      } catch (err) {
        // User cancelled sharing or sharing failed
        if ((err as Error).name !== "AbortError") {
          logger.error("Share failed:", err);
          // Fallback to copy link
          await copyToClipboard(shareData.url, setIsLinkCopied);
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      await copyToClipboard(shareData?.url || "", setIsLinkCopied);
    }
  };

  const handlePlatformClick = (platform: SocialPlatform) => {
    if (platform.onClick) {
      platform.onClick();
    } else if (platform.getShareUrl) {
      const shareUrl = platform.getShareUrl();
      if (typeof window !== "undefined") {
        // Special handling for email links
        if (platform.name === "Email") {
          window.location.href = shareUrl;
        } else {
          // For mobile, try to open in the same window to trigger app switching
          if (isMobile) {
            window.open(shareUrl, "_blank");
          } else {
            // For desktop, use popup window
            const popup = window.open(
              shareUrl,
              "_blank",
              "noopener,noreferrer,width=600,height=400"
            );
            if (!popup) {
              // If popup blocked, try direct navigation
              window.open(shareUrl, "_blank", "noopener,noreferrer");
            }
          }
        }
      }
    }
  };

  // On mobile with Web Share API support, prioritize native sharing
  if (isMobile && webShareSupported) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Button
          variant="outline"
          className="inline-flex items-center w-full justify-center rounded-full border border-[#548281] px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-[#548281] hover:text-white shadow hover:bg-[#2f4858] transition-colors duration-300 ease-in-out focus:outline-none"
          onClick={handleNativeShare}
        >
          <Share2 className="h-3 w-3 mr-1" />
          Share
        </Button>
      </div>
    );
  }

  // Fallback: Show dropdown menu (for desktop or mobile without Web Share API)
  return (
    <div className={`flex gap-2 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="inline-flex items-center w-full justify-center rounded-full border border-[#548281] px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-[#548281] hover:text-white shadow hover:bg-[#2f4858] transition-colors duration-300 ease-in-out focus:outline-none"
          >
            <ShareIcon className="h-3 w-3 mr-1" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* On mobile without Web Share API, show native share button first */}
          {isMobile && (
            <DropdownMenuItem
              onClick={handleNativeShare}
              className="cursor-pointer hover:bg-muted/50"
            >
              <Share2 className="h-4 w-4 mr-2 text-blue-600" />
              <span>Share via Apps</span>
            </DropdownMenuItem>
          )}
          {socialPlatforms.map((platform, index) => (
            <DropdownMenuItem
              key={`${platform.name}-${index}`}
              onClick={() => handlePlatformClick(platform)}
              className="cursor-pointer hover:bg-muted/50"
            >
              <platform.icon className={`h-4 w-4 mr-2 ${platform.color}`} />
              <span>{platform.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
