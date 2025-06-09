// lib/sanity/queries.ts
import { client } from "./client";
import { logger } from "@/lib/utils/logger";
import {
  SanityHomePage,
  SanityCampaign,
  SanityArticle,
  SanityConference,
  SanitySlug,
  SanityAboutPage,
  SanityVolunteerPage,
} from "../types";

// CONSULTA PRINCIPAL OPTIMIZADA
// Esta función obtiene toda la página de inicio en una sola petición
export async function getHomePageData(): Promise<SanityHomePage> {
  const data = await client.fetch(
    `*[_type == "homePage"][0] {
      title,
      // Hero Section
      heroHeading,
      heroSubheading,
      heroPrimaryButtonText,
      heroSecondaryButtonText,
      heroVideo { asset-> { url } },
      heroImage { asset-> { url } },
      
      // How It Works Section
      howItWorksHeading,
      howItWorksDescription,
      howItWorksSteps[] {
        title,
        description
      },
      
      // Campaigns Section
      campaignsHeading,
      campaignsDescription,
   campaigns[]-> {
  _id,
  title,
  slug,
  category,
  description,
  goalPledges,
  featuredImage { asset-> { url } },
},
      
      // Ways to Support Section
      waysToSupportHeading,
      waysToSupportDescription,
      waysToSupportItems[] {
        title,
        description,
        icon { asset-> { url } },
        buttonText,
        buttonLink
      },
      
      // Articles Section
      articlesHeading,
      articlesDescription,
      articles[]-> {
        _id,
        title,
        slug,
        publishedAt,
        excerpt,
        image { asset-> { url } }
      },
      
      // Conferences Section
      conferencesHeading,
      conferencesDescription,
      conferences[]-> {
        _id,
        title,
        slug,
        startDateTime,
        endDateTime,
        timezone,
        location,
        image { asset-> { url } },
        description
      }
    }`,
    {},
    { next: { revalidate: 60 } }
  );
  return {
    heroSection: {
      heroHeading: data.heroHeading,
      heroSubheading: data.heroSubheading,
      heroPrimaryButtonText: data.heroPrimaryButtonText,
      heroSecondaryButtonText: data.heroSecondaryButtonText,
      heroVideo: data.heroVideo,
      heroImage: data.heroImage,
    },
    howItWorksSection: {
      howItWorksHeading: data.howItWorksHeading,
      howItWorksDescription: data.howItWorksDescription,
      howItWorksSteps: data.howItWorksSteps,
    },
    campaignsSection: {
      campaignsHeading: data.campaignsHeading,
      campaignsDescription: data.campaignsDescription,
      campaigns: data.campaigns,
    },
    waysToSupportSection: {
      waysToSupportHeading: data.waysToSupportHeading,
      waysToSupportDescription: data.waysToSupportDescription,
      waysToSupportItems: data.waysToSupportItems,
      secondCardHeading: data.secondCardHeading,
      secondCardDescription: data.secondCardDescription,
      secondCardButtonText: data.secondCardButtonText,
      secondCardSecondHeading: data.secondCardSecondHeading,
      secondCardListOfSupportImpact: data.secondCardListOfSupportImpact,
    },
    articlesSection: {
      articlesHeading: data.articlesHeading,
      articlesDescription: data.articlesDescription,
      articles: data.articles,
    },
    conferencesSection: {
      conferencesHeading: data.conferencesHeading,
      conferencesDescription: data.conferencesDescription,
      conferences: data.conferences,
    },
  };
}

// FUNCIONES AUXILIARES QUE EXTRAEN DATOS DE LA CONSULTA PRINCIPAL
// Estas funciones mantienen compatibilidad, pero no hacen peticiones adicionales

// export async function getHeroSection(): Promise<SanityHeroSection> {
//   const data = (await getHomePageData()).heroSection;
//   return {
//     heroHeading: data.heroHeading,
//     heroSubheading: data.heroSubheading,
//     heroPrimaryButtonText: data.heroPrimaryButtonText,
//     heroSecondaryButtonText: data.heroSecondaryButtonText,
//     heroVideo: data.heroVideo,
//     heroImage: data.heroImage,
//   };
// }

// export async function getHowItWorksSection(): Promise<SanityHowItWorksSection> {
//   const data = (await getHomePageData()).howItWorksSection;
//   return {
//     howItWorksHeading: data.howItWorksHeading,
//     howItWorksDescription: data.howItWorksDescription,
//     howItWorksSteps: data.howItWorksSteps,
//   };
// }

// export async function getCampaignsSection(): Promise<SanityCampaignsSection> {
//   const data = (await getHomePageData()).campaignsSection;
//   return {
//     campaignsHeading: data.campaignsHeading,
//     campaignsDescription: data.campaignsDescription,
//     campaigns: data.campaigns,
//   };
// }

// export async function getWaysToSupportSection(): Promise<SanityWaysToSupportSection> {
//   const data = (await getHomePageData()).waysToSupportSection;
//   return {
//     waysToSupportHeading: data.waysToSupportHeading,
//     waysToSupportDescription: data.waysToSupportDescription,
//     waysToSupportItems: data.waysToSupportItems,
//   };
// }

// export async function getArticlesSection(): Promise<SanityArticlesSection> {
//   const data = (await getHomePageData()).articlesSection;
//   return {
//     articlesHeading: data.articlesHeading,
//     articlesDescription: data.articlesDescription,
//     articles: data.articles,
//   };
// }

// export async function getConferencesSection(): Promise<SanityConferencesSection> {
//   const data = (await getHomePageData()).conferencesSection;
//   return {
//     conferencesHeading: data.conferencesHeading,
//     conferencesDescription: data.conferencesDescription,
//     conferences: data.conferences,
//   };
// }

// CONSULTAS PARA ELEMENTOS INDEPENDIENTES
// Estas consultas son para cuando necesitas estos elementos fuera del contexto de la página principal

export async function getCampaigns(): Promise<SanityCampaign[]> {
  return client.fetch(
    `*[_type == "campaign"] {
      _id,
      title,
      slug,
      category,
      description,
      goalPledges,
      commitmentText,
      contentText,
      featuredImage { asset-> { url } },
      gallery[] {
        type,
        alt,
        image { asset-> { url } },
        video { asset-> { url } }
      }
    }`,
    {},
    { next: { revalidate: 60 } }
  );
}

// Memory cache for campaign data to reduce Sanity API calls
const campaignCache = new Map<
  string,
  { data: SanityCampaign; timestamp: number }
>();
const CAMPAIGN_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

export async function getCampaignBySlug(slug: string): Promise<SanityCampaign> {
  try {
    // Check in-memory cache first
    const cacheKey = `campaign-${slug}`;
    const cachedItem = campaignCache.get(cacheKey);
    const now = Date.now();

    // Return cached data if valid
    if (cachedItem && now - cachedItem.timestamp < CAMPAIGN_CACHE_TTL) {
      logger.log(`[Cache Hit] Using cached campaign data for: ${slug}`);
      return cachedItem.data;
    }

    // If not in cache or expired, fetch from Sanity
    logger.log(`[Cache Miss] Fetching campaign data from Sanity for: ${slug}`);

    // Restore the original query structure to match your existing data
    const campaignData = await client.fetch(
      `*[_type == "campaign" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        category,
        description,
        goalPledges,
        commitmentText,
        contentText,
        featuredImage { asset-> { url } },
        gallery[] {
          type,
          alt,
          image { asset-> { url } },
          video { asset-> { url } }
        },
        solutionsSection {
          heading,
          paragraphs,
          subheading,
        },
        waysToSupportTabs[] {
          type,
          title,
          content,
          conferenceRef->{
            _id, 
            title, 
            slug, 
            startDateTime,
            endDateTime,
            timezone,
            location, 
            image { asset-> { url } }, 
            description,
            about[] {
              ...,
              _type == "inlineImage" => {
                ...,
                asset-> {
                  url,
                  metadata {
                    dimensions {
                      width,
                      height
                    }
                  }
                }
              },
              _type == "videoEmbed" => {
                ...,
                url,
                title,
                caption
              },
              _type == "callout" => {
                ...,
                type,
                title,
                content
              },
              _type == "divider" => {
                ...,
                style
              },
              _type == "columns" => {
                ...,
                leftColumn,
                rightColumn
              }
            },
            category,
            price,
            organizer,
            speakers[] {
              _id,
              name,
              role,
              "image": {
                "asset": {
                  "url": image.asset->url
                }
              }
            },
            "gallery": gallery[].asset->{ url }
          },
          conferenceDetails {
            date,
            registrationForm,
            description
          }
        }
      }`,
      { slug },
      { next: { revalidate: 60 } }
    );

    // Update cache with new data
    if (campaignData) {
      logger.log(
        `[Sanity] Successfully fetched campaign: ${campaignData.title}`
      );
      campaignCache.set(cacheKey, { data: campaignData, timestamp: now });
    } else {
      logger.log(`[Sanity] No campaign found for slug: ${slug}`);
    }

    return campaignData;
  } catch (error) {
    logger.error(
      `[Sanity Error] Failed to fetch campaign for slug ${slug}:`,
      error
    );
    throw error;
  }
}

// Cache for campaign slugs
const slugsCache: { data: SanitySlug[] | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};
const SLUGS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCampaignSlugs(): Promise<SanitySlug[]> {
  const now = Date.now();

  // Return cached data if valid
  if (slugsCache.data && now - slugsCache.timestamp < SLUGS_CACHE_TTL) {
    logger.log("[Cache Hit] Using cached campaign slugs");
    return slugsCache.data;
  }

  logger.log("[Cache Miss] Fetching campaign slugs from Sanity");
  const slugs = await client.fetch(
    `*[_type == "campaign" && defined(slug.current)] {
      slug
    }`,
    {},
    {
      next: { revalidate: 60 },
      cache: "force-cache",
    }
  );

  // Update cache
  slugsCache.data = slugs;
  slugsCache.timestamp = now;

  return slugs;
}

export async function getArticles(): Promise<SanityArticle[]> {
  return client.fetch(
    `*[_type == "article"] | order(publishedAt desc) {
      _id,
      title,
      slug { current },
      publishedAt,
      image { 
        asset-> { 
          url,
          metadata {
            dimensions {
              width,
              height
            }
          }
        }
      },
      excerpt,
      author-> {
        name,
        image { 
          asset-> { 
            url,
            metadata {
              dimensions {
                width,
                height
              }
            }
          }
        }
      },
      categories[]-> {
        _id,
        title
      }
    }`,
    {},
    { next: { revalidate: 60 } }
  );
}

export async function getConferences(): Promise<SanityConference[]> {
  return client.fetch(
    `*[_type == "conference"] | order(startDateTime asc) {
      _id,
      title,
      slug,
      startDateTime,
      endDateTime,
      timezone,
      location,
      image { asset-> { url } },
      description
    }`,
    {},
    { next: { revalidate: 60 } }
  );
}

export async function getArticleBySlug(slug: string): Promise<{
  article: SanityArticle;
  relatedArticles: SanityArticle[];
}> {
  return client.fetch(
    `{
      "article": *[_type == "article" && slug.current == $slug][0] {
        _id,
        title,
        slug { current },
        publishedAt,
        image { 
          asset-> { 
            url,
            metadata {
              dimensions {
                width,
                height
              }
            }
          }
        },
        excerpt,
        content[] {
          ...,
          _type == "inlineImage" => {
            ...,
            asset-> {
              url,
              metadata {
                dimensions {
                  width,
                  height
                }
              }
            }
          },
          _type == "videoEmbed" => {
            ...,
            url,
            title,
            caption
          },
          _type == "callout" => {
            ...,
            type,
            title,
            content
          },
          _type == "divider" => {
            ...,
            style
          },
          _type == "columns" => {
            ...,
            leftColumn,
            rightColumn
          }
        },
        author-> {
          name,
          image { 
            asset-> { 
              url,
              metadata {
                dimensions {
                  width,
                  height
                }
              }
            }
          }
        },
        categories[]-> {
          _id,
          title
        }
      },
      "relatedArticles": *[_type == "article" && slug.current != $slug && count(categories[@._ref in *[_type == "article" && slug.current == $slug][0].categories[]._ref]) > 0] | order(publishedAt desc)[0...3] {
        _id,
        title,
        slug { current },
        publishedAt,
        image { 
          asset-> { 
            url
          }
        },
        excerpt,
        author-> {
          name,
          image { 
            asset-> { 
              url
            }
          }
        },
        categories[]-> {
          _id,
          title
        }
      }
    }`,
    { slug },
    { next: { revalidate: 60 } }
  );
}

export async function getConferenceBySlug(slug: string) {
  const query = `*[_type == "conference" && slug.current == $slug][0] {
    _id,
    title,
    description,
    startDateTime,
    endDateTime,
    timezone,
    location,
    category,
    price,
    "organizer": {
      "name": organizer.name,
      "logo": organizer.logo.asset->url
    },
    "slug": slug.current,
    "image": {
      "asset": {
        "url": image.asset->url
      }
    },
    about[] {
      ...,
      _type == "inlineImage" => {
        ...,
        asset-> {
          url,
          metadata {
            dimensions {
              width,
              height
            }
          }
        }
      },
      _type == "videoEmbed" => {
        ...,
        url,
        title,
        caption
      },
      _type == "callout" => {
        ...,
        type,
        title,
        content
      },
      _type == "divider" => {
        ...,
        style
      },
      _type == "columns" => {
        ...,
        leftColumn,
        rightColumn
      }
    },
    speakers[] {
      _id,
      name,
      role,
      "image": {
        "asset": {
          "url": image.asset->url
        }
      }
    },
    "gallery": gallery[].asset->{
      "url": url
    },
    "relatedCampaign": relatedCampaign->{
      _id,
      title,
      "slug": slug.current
    }
  }`;

  const event = await client.fetch(query, { slug });
  return event;
}

export async function getConferenceByRef(ref: string) {
  const query = `*[_type == "conference" && _id == $ref][0]`;
  const params = { ref };
  return await client.fetch(query, params);
}

// ===== ABOUT PAGE QUERIES =====
// Cache for about page data to reduce API calls
const aboutPageCache: { data: SanityAboutPage | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};
const ABOUT_PAGE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Fetches the complete About Page data from Sanity CMS
 * Includes hero section, who we are, mission, philosophy, charter, and contact information
 * @returns Promise<SanityAboutPage> - Complete about page data
 */
export async function getAboutPageData(): Promise<SanityAboutPage> {
  try {
    const now = Date.now();

    // Check cache first to reduce API calls
    if (
      aboutPageCache.data &&
      now - aboutPageCache.timestamp < ABOUT_PAGE_CACHE_TTL
    ) {
      logger.log("[Cache Hit] Using cached About Page data");
      return aboutPageCache.data;
    }

    logger.log("[Cache Miss] Fetching About Page data from Sanity");

    // Fetch all about page data in a single optimized query
    const data = await client.fetch(
      `*[_type == "aboutPage"][0] {
        _id,
        title,
        
        // Hero Section
        heroSection {
          heroHeading,
          heroSubheading,
          heroBgImage { asset-> { url } }
        },
        
        // Who We Are Section
        whoWeAreSection {
          whoWeAreHeading,
          whoWeAreFirstParagraph,
          whoWeAreImage { asset-> { url } },
          whoWeAreSecondParagraph,
          whoWeAreThirdParagraph
        },
        
        // Our Mission Section
        ourMissionSection {
          ourMissionHeading,
          ourMissionParagraph,
          ourMissionImage { asset-> { url } }
        },
        
        // Our Philosophy Section
        ourPhilosophySection {
          ourPhilosophyHeading,
          ourPhilosophyParagraph,
          ourPhilosophyImage { asset-> { url } }
        },
        
        // Our Charter Section
        ourCharterSection {
          ourCharterHeading,
          ourCharterParagraph,
          charterPrinciples[] {
            title
          }
        },
        
        // Mission Highlight Card
        missionHighlightCard {
          title,
          description
        },
        
        // Get In Touch Card with referenced contact information
        getInTouchCard {
          getInTouchHeading,
          contactInformation-> {
            _id,
            title,
            email,
            phone,
            address,
            socialMedia[] {
              platform,
              url
            }
          }
        },
        
        // Our Commitment Card
        ourCommitmentCard {
          title,
          description
        }
      }`,
      {},
      { next: { revalidate: 60 } }
    );

    if (!data) {
      throw new Error("No About Page data found in Sanity");
    }

    // Update cache with fresh data
    aboutPageCache.data = data;
    aboutPageCache.timestamp = now;

    logger.log("[Sanity] Successfully fetched About Page data");
    return data;
  } catch (error) {
    logger.error("[Sanity Error] Failed to fetch About Page data:", error);
    throw error;
  }
}

// ===== VOLUNTEER PAGE QUERIES =====
// Cache for volunteer page data to reduce API calls
const volunteerPageCache: {
  data: SanityVolunteerPage | null;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};
const VOLUNTEER_PAGE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Fetches the complete Volunteer Page data from Sanity CMS
 * Includes hero section, ways to volunteer, convince high-profile figures, spread the word, and impact sections
 * @returns Promise<SanityVolunteerPage> - Complete volunteer page data
 */
export async function getVolunteerPageData(): Promise<SanityVolunteerPage> {
  try {
    const now = Date.now();

    // Check cache first to reduce API calls
    if (
      volunteerPageCache.data &&
      now - volunteerPageCache.timestamp < VOLUNTEER_PAGE_CACHE_TTL
    ) {
      logger.log("[Cache Hit] Using cached Volunteer Page data");
      return volunteerPageCache.data;
    }

    logger.log("[Cache Miss] Fetching Volunteer Page data from Sanity");

    // Fetch all volunteer page data in a single optimized query
    const data = await client.fetch(
      `*[_type == "volunteerPage"][0] {
        _id,
        title,
        
        // Hero Section
        heroSection {
          heroHeading,
          heroSubheading,
          heroButtonText,
          heroBgImage { asset-> { url } }
        },
        
        // Ways to Volunteer Section
        waysToVolunteerSection {
          waysToVolunteerHeading,
          waysToVolunteerParagraph
        },
        
        // Convince High-Profile Figures Section
        convinceHighProfileSection {
          convinceHighProfileHeading,
          convinceHighProfileParagraph,
          convinceHighProfileChecklist[] {
            title
          },
          convinceHighProfileImage { asset-> { url } }
        },
        
        // Spread the Word Section
        spreadTheWordSection {
          spreadTheWordHeading,
          spreadTheWordParagraph,
          spreadTheWordCards[] {
            title,
            description
          },
          spreadTheWordImage { asset-> { url } }
        },
        
        // Impact Section
        impactSection {
          impactHeading,
          impactParagraph,
          impactButtonText
        }
      }`,
      {},
      { next: { revalidate: 60 } }
    );

    if (!data) {
      throw new Error("No Volunteer Page data found in Sanity");
    }

    // Update cache with fresh data
    volunteerPageCache.data = data;
    volunteerPageCache.timestamp = now;

    logger.log("[Sanity] Successfully fetched Volunteer Page data");
    return data;
  } catch (error) {
    logger.error("[Sanity Error] Failed to fetch Volunteer Page data:", error);
    throw error;
  }
}
