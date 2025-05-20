import type React from "react";
export interface SocialLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export interface FooterLink {
  href: string;
  label: string;
}

export interface Stat {
  icon: React.ReactNode;
  value: string;
  label: string;
}

export interface ProcessStep {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface Project {
  image: string;
  title: string;
  description: string;
  votes: number;
}

export interface Leader {
  id: number;
  image: string;
  name: string;
  position: string;
}

export interface Article {
  image: string;
  title: string;
  description: string;
  date?: string;
}

export interface Conference {
  id: number;
  image: string;
  date: string;
  title: string;
  description: string;
}

// About page types
export interface AboutSection {
  heading: string;
  content: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

export interface AboutPageBase {
  title: string;
  content: string;
}

export interface MainAboutPage extends AboutPageBase {
  sections: AboutSection[];
  team_members?: TeamMember[];
  intro_paragraphs?: string[];
  charter_points?: string[];
  partnerships_text?: string;
}

export interface TeamAboutPage extends AboutPageBase {
  team_members: TeamMember[];
}

export type AboutPage = MainAboutPage | TeamAboutPage | AboutPageBase;

// Campaign/Pledge types
export interface Campaign {
  id: string;
  slug: string;
  image: string;
  title: string;
  description: string;
  link: string;
  raisedPledges: number;
  goalPledges: number;
  commitmentText: string;
  media?: MediaItem[];
  category: string;
}

export interface MediaItem {
  type: "image" | "video";
  src: string;
  alt: string;
}

// Solution types for campaign details
export interface SolutionGuideline {
  title: string;
  description: string;
}

export interface SolutionDetails {
  intro: string;
  guidelines: SolutionGuideline[];
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  rank: string;
  expanded?: boolean;
  details?: SolutionDetails;
}

export interface PartySolutions {
  id: string;
  name: string;
  partyNumber: number;
  logo: string;
  solutions: Solution[];
}

// Extended Campaign type with solutions
export interface CampaignWithSolutions extends Campaign {
  partySolutions?: PartySolutions[];
  contentText?: {
    paragraphs: string[];
    title?: string;
  };
  conference?: {
    title: string;
    date: string;
    time: string;
    description: string;
    about: string;
    images: {
      banner: string;
      gallery: {
        src: string;
        alt: string;
      }[];
    };
  };
}
