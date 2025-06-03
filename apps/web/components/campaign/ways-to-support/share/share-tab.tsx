"use client";

import { useState } from "react";
import {
  Share2,
  MessageCircle,
  Users,
  Heart,
  Copy,
  Check,
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
import { Card, CardContent } from "@/components/ui/card";

const shareData = {
  title: "Pledge for Peace",
  text: "Join me in supporting peace initiatives around the world. Together we can make a difference!",
  url: "https://pledge4peace.org",
  hashtags: "PeaceForAll, Pledge4Peace",
};

const socialPlatforms = [
  {
    name: "Facebook",
    icon: Facebook,
    color: "text-[#1877F2]",
    getShareUrl: () =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.text)}`,
  },
  {
    name: "X (Twitter)",
    icon: Twitter,
    color: "text-black",
    getShareUrl: () =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}&hashtags=${shareData.hashtags}`,
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-[#0A66C2]",
    getShareUrl: () =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
  },
  {
    name: "Copy Link",
    icon: LinkIcon,
    color: "text-foreground",
    onClick: (setIsLinkCopied: (value: boolean) => void) => {
      navigator.clipboard.writeText(shareData.url);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    },
  },
];

export default function ShareTab() {
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const shareUrl = shareData.url;

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
    // Check if Web Share API is supported
    if (typeof window !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url,
        });
      } catch (err) {
        // User cancelled the share or there was an error
        console.log("Share was cancelled or failed:", err);
      }
    } else {
      // Fallback to copy to clipboard
      await copyToClipboard(shareData.url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Explore other ways to help</h3>
        <p className="text-sm text-muted-foreground">
          Amplify our message of peace by sharing with your network and
          community.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Social Media</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Share our campaign on Facebook, X (Twitter), Instagram, and
              LinkedIn to reach your friends and followers.
            </p>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="flex-1">
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
                      <platform.icon
                        className={`h-4 w-4 mr-2 ${platform.color}`}
                      />
                      <span>{platform.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Native share button for mobile */}
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
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Word of Mouth</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Talk to family, friends, and colleagues about our peace initiative
              and encourage them to get involved.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Community Groups</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Present our mission to local organizations, religious groups, and
              community associations.
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h4 className="font-medium">Personal Networks</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Send personalized messages to your contacts explaining why this
              cause matters to you.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-center">Share Our Campaign Link</h4>
        <div className="flex gap-2">
          <div className="flex-1 bg-background rounded border px-3 py-2 text-sm text-muted-foreground">
            {shareUrl}
          </div>
          <Button
            size="sm"
            onClick={async () => {
              await copyToClipboard(shareUrl);
            }}
            disabled={isLinkCopied}
            className="whitespace-nowrap"
          >
            {isLinkCopied ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
