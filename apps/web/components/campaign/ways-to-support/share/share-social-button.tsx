"use client";

import {
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  Share as ShareIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export interface ShareData {
  title: string;
  text: string;
  url: string;
  hashtags?: string;
}

interface ShareButtonProps {
  shareData: ShareData | undefined;
  className?: string;
  showNativeShareButton?: boolean;
}

const getSocialPlatforms = (
  shareData: ShareData | undefined,
  setIsLinkCopied: (value: boolean) => void
) => [
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
    getShareUrl: () =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareData?.url || "")}&text=${encodeURIComponent(shareData?.text || "")}${shareData?.hashtags ? `&hashtags=${shareData.hashtags}` : ""}`,
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-[#0A66C2]",
    getShareUrl: () =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData?.url || "")}`,
  },
  {
    name: "Copy Link",
    icon: LinkIcon,
    color: "text-foreground",
    onClick: (setIsLinkCopied: (value: boolean) => void) => {
      navigator.clipboard.writeText(shareData?.url || "");
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    },
  },
];

export function ShareSocialButton({
  shareData,
  className = "",
  showNativeShareButton = false,
}: ShareButtonProps) {
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const socialPlatforms = getSocialPlatforms(shareData, setIsLinkCopied);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
      return true;
    } catch (err) {
      console.error("Failed to copy text:", err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 2000);
        return true;
      } catch (fallbackErr) {
        console.error("Fallback copy failed:", fallbackErr);
        return false;
      }
    }
  };

  const handleNativeShare = async () => {
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share was cancelled or failed:", err);
      }
    } else {
      await copyToClipboard(shareData?.url || "");
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="inline-flex items-center w-full justify-center rounded-full border border-[#548281] px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium text-[#548281] group-hover:text-white shadow group-hover:bg-[#2f4858] transition-colors duration-300 ease-in-out focus:outline-none"
          >
            <ShareIcon className="h-3 w-3 mr-1" />
            Share
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {socialPlatforms.map((platform) => (
            <DropdownMenuItem
              key={platform.name}
              onClick={() => {
                if (platform.onClick) {
                  platform.onClick(setIsLinkCopied);
                } else {
                  window.open(
                    platform.getShareUrl(),
                    "_blank",
                    "noopener,noreferrer"
                  );
                }
              }}
              className="cursor-pointer"
            >
              <platform.icon className={`h-4 w-4 mr-2 ${platform.color}`} />
              <span>{platform.name}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Native share button for mobile */}
      {showNativeShareButton && (
        <div className="md:hidden">
          <Button
            size="sm"
            variant="outline"
            onClick={handleNativeShare}
            className="w-full"
          >
            <Share2 className="h-3 w-3 mr-1" />
            {isLinkCopied ? "Link Copied!" : "Share"}
          </Button>
        </div>
      )}
    </div>
  );
}
