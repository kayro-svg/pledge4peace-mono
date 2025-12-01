"use client";

import { Button, type ButtonProps } from "@/components/ui/button";

interface ScrollToSectionButtonProps extends Omit<ButtonProps, "onClick"> {
  sectionId: string;
  children: React.ReactNode;
}

export function ScrollToSectionButton({
  sectionId,
  children,
  ...buttonProps
}: ScrollToSectionButtonProps) {
  const scrollToSection = () => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Button {...buttonProps} onClick={scrollToSection}>
      {children}
    </Button>
  );
}
