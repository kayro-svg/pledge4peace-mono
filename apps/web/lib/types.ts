// lib/types.ts

// SECTION 1: SANITY CMS TYPES
// ----------------------------------------------------------------------

// Sanity Base Types
export interface SanityImage {
  asset: { url: string };
}

export interface SanitySlug {
  _type: "slug";
  current: string;
}

// Sanity Home Page Types
export interface SanityHeroSection {
  heroHeading: string;
  heroSubheading: string;
  heroPrimaryButtonText: string;
  heroSecondaryButtonText: string;
  heroVideo?: { asset: { url: string } };
  heroImage?: { asset: { url: string } };
}

export interface SanityHowItWorksStep {
  title: string;
  description: string;
  icon: JSX.Element;
}

export interface SanityHowItWorksSection {
  howItWorksHeading: string;
  howItWorksDescription: string;
  howItWorksSteps: SanityHowItWorksStep[];
}

export interface SanityWayToSupport {
  title: string;
  description: string;
  icon: { asset: { url: string } };
  buttonText: string;
  buttonLink: string;
}

export interface SanityWaysToSupportSection {
  waysToSupportHeading: string;
  waysToSupportDescription: string;
  waysToSupportItems: SanityWayToSupport[];
  secondCardHeading: string;
  secondCardDescription: string;
  secondCardButtonText: string;
  secondCardSecondHeading: string;
  secondCardListOfSupportImpact: string[];
}

export interface SanityHomePage {
  heroSection: SanityHeroSection;
  howItWorksSection: SanityHowItWorksSection;
  campaignsSection: SanityCampaignsSection;
  waysToSupportSection: SanityWaysToSupportSection;
  articlesSection: SanityArticlesSection;
  conferencesSection: SanityConferencesSection;
}

// Sanity Campaign Types
export interface SanityCampaignContentText {
  title?: string;
  paragraphs?: string[];
}

export interface SanityCampaignGalleryItem {
  type: "image" | "video";
  alt?: string;
  image?: SanityImage;
  video?: { asset: { url: string } };
}

export interface SanitySolution {
  title: string;
  description: string;
}

export interface SanitySolutionsSection {
  heading: string;
  paragraphs: string[];
  subheading: string;
  // solutions: SanitySolution[];
}

export interface SanityWaysToSupportTab {
  type: "conference" | "donations" | "volunteering" | "share";
  title: string;
  content: string;
  conferenceRef?: { _ref: string; _type: "reference" };
  conferenceDetails?: {
    date?: string;
    registrationForm?: string;
    description?: string;
  };
}

export interface SanityCampaign {
  _id: string;
  title: string;
  slug: SanitySlug;
  category?: "Peace" | "Democracy" | "Environment" | "Education" | "Health";
  description: string;
  goalPledges: number;
  pledgeCommitmentItems?: string[];
  contentText?: SanityCampaignContentText;
  featuredImage?: SanityImage;
  gallery?: SanityCampaignGalleryItem[];
  solutionsSection?: SanitySolutionsSection;
  waysToSupportTabs?: SanityWaysToSupportTab[];
}

export interface SanityCampaignsSection {
  campaignsHeading: string;
  campaignsDescription: string;
  campaigns: SanityCampaign[];
}

// Sanity Article Types
export interface SanityAuthor {
  _id: string;
  name: string;
  image?: SanityImage;
  bio?: string;
}

export interface SanityCategory {
  _id: string;
  title: string;
  description?: string;
}

export interface SanityArticle {
  _id: string;
  title: string;
  slug: SanitySlug;
  publishedAt: string;
  image?: SanityImage;
  excerpt?: string;
  author?: SanityAuthor;
  categories?: SanityCategory[];
  content?: any[]; // Portable Text content
}

export interface SanityArticlesSection {
  articlesHeading: string;
  articlesDescription: string;
  articles: SanityArticle[];
}

// Sanity Conference Types
export interface SanitySpeaker {
  _id: string;
  name: string;
  role?: string;
  image?: SanityImage;
}

export interface SanityOrganizer {
  name: string;
  logo?: string;
}

export interface SanityConference {
  _id: string;
  title: string;
  slug: SanitySlug;
  startDateTime: string;
  endDateTime?: string;
  timezone: string;
  location: string;
  image?: SanityImage;
  description: string;
  about?: any[]; // Rich content array (Portable Text)
  category?: string;
  organizer?: SanityOrganizer;
  price?: number;
  speakers?: SanitySpeaker[];
  gallery?: { url: string }[];
  relatedCampaign?: {
    _id: string;
    title: string;
    slug: SanitySlug;
  };
}

export interface SanityConferencesSection {
  conferencesHeading: string;
  conferencesDescription: string;
  conferences: SanityConference[];
}

// Sanity Contact Information Types
export interface SanitySocialMedia {
  platform:
    | "facebook"
    | "twitter"
    | "instagram"
    | "linkedin"
    | "youtube"
    | "tiktok";
  url: string;
}

export interface SanityContactInformation {
  _id: string;
  title: string;
  email?: string;
  phone?: string;
  address?: string;
  socialMedia?: SanitySocialMedia[];
}

// Sanity About Page Types
export interface SanityAboutHeroSection {
  heroHeading: string;
  heroSubheading: string;
  heroBgImage?: SanityImage;
}

export interface SanityAboutWhoWeAreSection {
  whoWeAreHeading: string;
  whoWeAreFirstParagraph: string;
  whoWeAreImage?: SanityImage;
  whoWeAreSecondParagraph: string;
  whoWeAreThirdParagraph: string;
}

export interface SanityAboutMissionSection {
  ourMissionHeading: string;
  ourMissionParagraph: string;
  ourMissionImage?: SanityImage;
}

export interface SanityAboutPhilosophySection {
  ourPhilosophyHeading: string;
  ourPhilosophyParagraph: string;
  ourPhilosophyImage?: SanityImage;
}

export interface SanityCharterPrinciple {
  title: string;
}

export interface SanityAboutCharterSection {
  ourCharterHeading: string;
  ourCharterParagraph: string;
  charterPrinciples: SanityCharterPrinciple[];
}

export interface SanityAboutMissionHighlightCard {
  title: string;
  description: string;
}

export interface SanityAboutGetInTouchCard {
  getInTouchHeading: string;
  contactInformation: SanityContactInformation;
}

export interface SanityAboutCommitmentCard {
  title: string;
  description: string;
}

export interface SanityAboutPage {
  _id: string;
  title: string;
  heroSection: SanityAboutHeroSection;
  whoWeAreSection: SanityAboutWhoWeAreSection;
  ourMissionSection: SanityAboutMissionSection;
  ourPhilosophySection: SanityAboutPhilosophySection;
  ourCharterSection: SanityAboutCharterSection;
  missionHighlightCard: SanityAboutMissionHighlightCard;
  getInTouchCard: SanityAboutGetInTouchCard;
  ourCommitmentCard: SanityAboutCommitmentCard;
}

// Sanity Volunteer Page Types
export interface SanityVolunteerHeroSection {
  heroHeading: string;
  heroSubheading: string;
  heroButtonText: string;
  heroBgImage?: SanityImage;
}

export interface SanityVolunteerWaysToVolunteerSection {
  waysToVolunteerHeading: string;
  waysToVolunteerParagraph: string;
}

export interface SanityVolunteerConvinceHighProfileChecklistItem {
  title: string;
}

export interface SanityVolunteerConvinceHighProfileSection {
  convinceHighProfileHeading: string;
  convinceHighProfileParagraph: string;
  convinceHighProfileChecklist: SanityVolunteerConvinceHighProfileChecklistItem[];
  convinceHighProfileImage?: SanityImage;
}

export interface SanityVolunteerSpreadTheWordCard {
  title: string;
  description: string;
}

export interface SanityVolunteerSpreadTheWordSection {
  spreadTheWordHeading: string;
  spreadTheWordParagraph: string;
  spreadTheWordCards: SanityVolunteerSpreadTheWordCard[];
  spreadTheWordImage?: SanityImage;
}

export interface SanityVolunteerImpactSection {
  impactHeading: string;
  impactParagraph: string;
  impactButtonText: string;
}

export interface SanityVolunteerPage {
  _id: string;
  title: string;
  heroSection: SanityVolunteerHeroSection;
  waysToVolunteerSection: SanityVolunteerWaysToVolunteerSection;
  convinceHighProfileSection: SanityVolunteerConvinceHighProfileSection;
  spreadTheWordSection: SanityVolunteerSpreadTheWordSection;
  impactSection: SanityVolunteerImpactSection;
}

// SECTION 2: APP INTERNAL TYPES
// ----------------------------------------------------------------------

import type { ReactNode } from "react";

// Social and Navigation Types
export interface SocialLink {
  href: string;
  label: string;
  icon: ReactNode;
}

export interface FooterLink {
  href: string;
  label: string;
}

// Hero Section Types
export interface HeroStat {
  icon: ReactNode;
  value: string;
  label: string;
}

// Process/How it Works Types
export interface ProcessStep {
  icon: ReactNode;
  title: string;
  description: string;
}

// Solution Types
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
  partyId: "israeli" | "palestinian";
  userId: string;
  expanded?: boolean;
  details?: SolutionDetails;
  likes: number;
  comments: number;
  userInteraction?: {
    liked: boolean;
    commented: boolean;
  };
  stats?: {
    likes: number;
    dislikes: number;
    shares: number;
    comments: number;
  };
}

export interface PartySolutions {
  id: string;
  name: string;
  partyNumber: number;
  logo: string;
  solutions: Solution[];
}

// About Page Types
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

// SECTION 3: APP DISPLAY TYPES (For UI rendering)
// ----------------------------------------------------------------------

// These types are used in the UI, often mapping from Sanity types to display types

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

// export interface MediaItem {
//   type: "image" | "video";
//   src: string;
//   alt: string;
// }

export interface MediaItem {
  type: "image" | "video";
  image?: { asset: { url: string } };
  video?: { asset: { url: string } };
  alt?: string;
}

export interface Campaign {
  id: string;
  slug: string;
  featuredImage?: { asset: { url: string } };
  gallery: MediaItem[];
  title: string;
  description: string;
  link: string;
  raisedPledges: number;
  goalPledges: number;
  commitmentText: string;
  category: string;
}

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
