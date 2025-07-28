// lib/sanity/queries.ts
import { getClient } from "./client";
import { logger } from "@/lib/utils/logger";
import { cleanTimezone } from "@/lib/utils/clean-timezone";
import {
  SanityHomePage,
  SanityCampaign,
  SanityArticle,
  SanityConference,
  SanitySlug,
  SanityAboutPage,
  SanityVolunteerPage,
} from "../types";

// ⚡ CONFIGURACIÓN DE CACHE POR ENTORNO
const isDevelopment = process.env.NODE_ENV === "development";

// En desarrollo: cache muy corto para ver cambios rápido
// En producción: cache más largo para optimizar rendimiento
const CACHE_TIMES = {
  development: {
    short: 10, // 10 segundos
    medium: 30, // 30 segundos
    long: 60, // 1 minuto
  },
  production: {
    short: 300, // 5 minutos
    medium: 1800, // 30 minutos
    long: 3600, // 1 hora
  },
};

const cache = isDevelopment ? CACHE_TIMES.development : CACHE_TIMES.production;

// CONSULTA PRINCIPAL OPTIMIZADA
// Esta función obtiene toda la página de inicio en una sola petición
export async function getHomePageData(): Promise<SanityHomePage> {
  // En desarrollo: usar cliente sin CDN para datos frescos
  const sanityClient = getClient({ forceFresh: isDevelopment });

  const data = await sanityClient.fetch(
    `*[_type == "homePage"][0] {
      _id,
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
    {
      next: {
        revalidate: cache.long, // Cache inteligente por entorno
        tags: ["homepage", "campaign", "article", "conference"],
      },
    }
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
      conferences:
        data.conferences?.map((conference: any) => ({
          ...conference,
          timezone: cleanTimezone(conference.timezone),
        })) || [],
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

export async function getCampaigns(limit?: number): Promise<SanityCampaign[]> {
  // 🚀 Usar cliente inteligente por entorno
  const sanityClient = getClient({ forceFresh: isDevelopment });

  return sanityClient.fetch(
    `*[_type == "campaign"] | order(publishedAt desc) ${
      limit ? `[0..${limit}]` : ""
    } {
      _id,
      title,
      slug,
      category,
      description,
      goalPledges,
      countriesInvolved[], 
      pledgeCommitmentItems[],
      contentText,
      featuredImage { asset-> { url } },
      gallery[] {
        type,
        alt,
        image { asset-> { url } },
        video { asset-> { url } }
      },
      parties[] {
        name,
        slug,
        description,
        icon { asset-> { url } },
        color,
        solutionLimit
      },
      _createdAt
    }`,
    {},
    {
      next: {
        revalidate: cache.medium, // ⚡ Cache inteligente por entorno
        tags: ["campaign"],
      },
    }
  );
}

export async function getCampaignBySlug(slug: string): Promise<SanityCampaign> {
  try {
    logger.log(`[Sanity] Fetching campaign data for: ${slug}`);

    // 🚀 Usar cliente inteligente por entorno
    const sanityClient = getClient({ forceFresh: isDevelopment });

    // Restore the original query structure to match your existing data
    const campaignData = await sanityClient.fetch(
      `*[_type == "campaign" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        category,
        description,
        goalPledges,
        countriesInvolved[], 
        pledgeCommitmentItems[],
        contentText,
        featuredImage { asset-> { url } },
        gallery[] {
          type,
          alt,
          image { asset-> { url } },
          video { asset-> { url } }
        },
        parties[] {
          name,
          slug,
          description,
          icon { asset-> { url } },
          color,
          solutionLimit
        },
        solutionsSection {
          heading,
          introParagraphs[] {
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
      {
        next: {
          revalidate: cache.medium, // ⚡ Cache inteligente por entorno
          tags: ["campaign", `campaign-${slug}`],
        },
      }
    );

    // Process campaign data
    if (campaignData) {
      logger.log(
        `[Sanity] Successfully fetched campaign: ${campaignData.title}`
      );

      // 🧹 Limpiar timezones corruptos en conferences dentro de campaigns
      if (campaignData.waysToSupportTabs) {
        campaignData.waysToSupportTabs = campaignData.waysToSupportTabs.map(
          (tab: any) => {
            if (tab.conferenceRef && tab.conferenceRef.timezone) {
              return {
                ...tab,
                conferenceRef: {
                  ...tab.conferenceRef,
                  timezone: cleanTimezone(tab.conferenceRef.timezone),
                },
              };
            }
            return tab;
          }
        );
      }
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

export async function getCampaignForDashboard(id: string): Promise<{
  title: string;
  id: string;
  slug: string;
}> {
  const sanityClient = getClient({ forceFresh: isDevelopment });
  const campaignTitle = await sanityClient.fetch(
    `*[_type == "campaign" && _id == $id][0] {
      _id,
      title,
      slug { current }
    }`,
    { id },
    {
      // ⚡ Cache inteligente por entorno para evitar que se haga la consulta cada vez que se renderiza el componente
      next: {
        revalidate: cache.long,
        tags: ["campaign", `campaign-${id}`],
      },
    }
  );
  return {
    title: campaignTitle.title,
    id: campaignTitle._id,
    slug: campaignTitle.slug.current,
  };
}

export async function getCampaignSlugs(): Promise<SanitySlug[]> {
  logger.log("[Sanity] Fetching campaign slugs");

  // 🚀 Usar cliente inteligente por entorno
  const sanityClient = getClient({ forceFresh: isDevelopment });

  const slugs = await sanityClient.fetch(
    `*[_type == "campaign" && defined(slug.current)] {
      slug
    }`,
    {},
    {
      next: {
        revalidate: cache.long, // ⚡ Cache inteligente por entorno
        tags: ["campaign"],
      },
    }
  );

  return slugs;
}

export async function getArticles(limit?: number): Promise<SanityArticle[]> {
  // 🚀 Usar cliente inteligente por entorno
  const sanityClient = getClient({ forceFresh: isDevelopment });

  return sanityClient.fetch(
    `*[_type == "article"] | order(publishedAt desc) ${
      limit ? `[0..${limit}]` : ""
    } {
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
    {
      next: {
        revalidate: cache.medium, // ⚡ Cache inteligente por entorno
        tags: ["article"],
      },
    }
  );
}

export async function getConferences(): Promise<SanityConference[]> {
  const sanityClient = getClient({ forceFresh: isDevelopment });

  const conferences = await sanityClient.fetch(
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
    {
      next: {
        revalidate: cache.short, // Conferences cambian frecuentemente
        tags: ["conference"],
      },
    }
  );

  // 🧹 Limpiar timezones corruptos en todas las conferences
  return conferences.map((conference: SanityConference) => ({
    ...conference,
    timezone: cleanTimezone(conference.timezone),
  }));
}

export async function getArticleBySlug(slug: string): Promise<{
  article: SanityArticle;
  relatedArticles: SanityArticle[];
}> {
  // 🚀 Usar cliente inteligente por entorno
  const sanityClient = getClient({ forceFresh: isDevelopment });

  return sanityClient.fetch(
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
        // SEO Fields
        seo {
          metaTitle,
          metaDescription,
          keywords,
          ogImage { 
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
          noIndex,
          canonicalUrl
        },
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
    {
      next: {
        revalidate: cache.medium, // ⚡ Cache inteligente por entorno
        tags: ["article", `article-${slug}`],
      },
    }
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

  const sanityClient = getClient({ forceFresh: isDevelopment });
  const event = await sanityClient.fetch(
    query,
    { slug },
    {
      next: {
        revalidate: cache.short, // Conferences pueden cambiar frecuentemente
        tags: ["conference", `conference-${slug}`],
      },
    }
  );

  // 🧹 Limpiar timezone corrupto si existe el evento
  if (event && event.timezone) {
    return {
      ...event,
      timezone: cleanTimezone(event.timezone),
    };
  }

  return event;
}

export async function getConferenceByRef(ref: string) {
  // 🚀 Usar cliente inteligente por entorno
  const sanityClient = getClient({ forceFresh: isDevelopment });

  const query = `*[_type == "conference" && _id == $ref][0]`;
  const params = { ref };

  return await sanityClient.fetch(query, params, {
    next: {
      revalidate: cache.short, // ⚡ Cache inteligente por entorno
      tags: ["conference", `conference-ref-${ref}`],
    },
  });
}

// ===== ABOUT PAGE QUERIES =====
/**
 * Fetches the complete About Page data from Sanity CMS
 * Includes hero section, who we are, mission, philosophy, charter, and contact information
 * @returns Promise<SanityAboutPage> - Complete about page data
 */
export async function getAboutPageData(): Promise<SanityAboutPage> {
  try {
    logger.log("[Sanity] Fetching About Page data");

    // 🚀 Usar cliente inteligente por entorno
    const sanityClient = getClient({ forceFresh: isDevelopment });

    // Fetch all about page data in a single optimized query
    const data = await sanityClient.fetch(
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
      {
        next: {
          revalidate: cache.medium, // ⚡ Cache inteligente por entorno
          tags: ["aboutPage"], // ✅ Tag correcto (coincide con revalidación)
        },
      }
    );

    if (!data) {
      throw new Error("No About Page data found in Sanity");
    }

    logger.log("[Sanity] Successfully fetched About Page data");
    return data;
  } catch (error) {
    logger.error("[Sanity Error] Failed to fetch About Page data:", error);
    throw error;
  }
}

// ===== VOLUNTEER PAGE QUERIES =====
/**
 * Fetches the complete Volunteer Page data from Sanity CMS
 * Includes hero section, ways to volunteer, convince high-profile figures, spread the word, and impact sections
 * @returns Promise<SanityVolunteerPage> - Complete volunteer page data
 */
export async function getVolunteerPageData(): Promise<SanityVolunteerPage> {
  try {
    logger.log("[Sanity] Fetching Volunteer Page data");

    // 🚀 Usar cliente inteligente por entorno
    const sanityClient = getClient({ forceFresh: isDevelopment });

    // Fetch all volunteer page data in a single optimized query
    const data = await sanityClient.fetch(
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
      {
        next: {
          revalidate: cache.medium, // ⚡ Cache inteligente por entorno
          tags: ["volunteerPage"], // ✅ Tag correcto (coincide con revalidación)
        },
      }
    );

    if (!data) {
      throw new Error("No Volunteer Page data found in Sanity");
    }

    logger.log("[Sanity] Successfully fetched Volunteer Page data");
    return data;
  } catch (error) {
    logger.error("[Sanity Error] Failed to fetch Volunteer Page data:", error);
    throw error;
  }
}
