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
export async function getHomePageData(
  lang: "en" | "es" = "en"
): Promise<SanityHomePage> {
  // En desarrollo: usar cliente sin CDN para datos frescos
  const sanityClient = getClient({ forceFresh: isDevelopment });

  const data = await sanityClient.fetch(
    `*[_type == "homePage"][0] {
      _id,
      title,
      // Hero Section
      "heroHeading": heroHeading[$lang],
      "heroSubheading": heroSubheading[$lang],
      "heroPrimaryButtonText": heroPrimaryButtonText[$lang],
      "heroSecondaryButtonText": heroSecondaryButtonText[$lang],
      heroVideo { asset-> { url } },
      heroImage { asset-> { url } },
      
      // How It Works Section
      "howItWorksHeading": howItWorksHeading[$lang],
      "howItWorksDescription": howItWorksDescription[$lang],
      howItWorksSteps[] {
        "title": title[$lang],
        "description": description[$lang]
      },
      
      // Campaigns Section
      "campaignsHeading": campaignsHeading[$lang],
      "campaignsDescription": campaignsDescription[$lang],
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
      "waysToSupportHeading": waysToSupportHeading[$lang],
      "waysToSupportDescription": waysToSupportDescription[$lang],
      waysToSupportItems[] {
        "title": title[$lang],
        "description": description[$lang],
        icon { asset-> { url } },
        buttonText,
        buttonLink
      },
      
      // Articles Section
      "articlesHeading": articlesHeading[$lang],
      "articlesDescription": articlesDescription[$lang],
      articles[]-> {
        _id,
        title,
        slug,
        publishedAt,
        excerpt,
        image { asset-> { url } }
      },
      
      // Conferences Section
      "conferencesHeading": conferencesHeading[$lang],
      "conferencesDescription": conferencesDescription[$lang],
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
    { lang },
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

// export async function getCampaigns(limit?: number): Promise<SanityCampaign[]> {
//   // 🚀 Usar cliente inteligente por entorno
//   const sanityClient = getClient({ forceFresh: isDevelopment });

//   return sanityClient.fetch(
//     `*[_type == "campaign"] | order(publishedAt desc) ${
//       limit ? `[0..${limit}]` : ""
//     } {
//       _id,
//       title,
//       slug,
//       category,
//       description,
//       goalPledges,
//       countriesInvolved[],
//       pledgeCommitmentItems[],
//       contentText,
//       featuredImage { asset-> { url } },
//       gallery[] {
//         type,
//         alt,
//         image { asset-> { url } },
//         video { asset-> { url } }
//       },
//       parties[] {
//         name,
//         slug,
//         description,
//         icon { asset-> { url } },
//         color,
//         solutionLimit
//       },
//       _createdAt
//     }`,
//     {},
//     {
//       next: {
//         revalidate: cache.medium, // ⚡ Cache inteligente por entorno
//         tags: ["campaign"],
//       },
//     }
//   );
// }

// lib/sanity/queries.ts
export async function getCampaigns(
  limit?: number,
  lang: "en" | "es" = "en"
): Promise<SanityCampaign[]> {
  const sanityClient = getClient({ forceFresh: isDevelopment });

  return sanityClient.fetch(
    /* groq */ `
      *[_type == "campaign"] | order(_createdAt desc) ${
        limit ? `[0..${limit}]` : ""
      }{
        _id,
        "title"      : coalesce(title[$lang],      title.en),
        "description": coalesce(description[$lang],description.en),
        slug,
        category,
        goalPledges,
        countriesInvolved[],
        featuredImage{asset->{url}}
      }
    `,
    { lang },
    {
      next: {
        revalidate: cache.medium,
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

// export async function getConferences(lang: "en" | "es" = "en"): Promise<SanityConference[]> {
//   const sanityClient = getClient({ forceFresh: isDevelopment });

//   const conferences = await sanityClient.fetch(
//     `*[_type == "conference"] | order(startDateTime asc) {
//       _id,
//       title,
//       slug,
//       startDateTime,
//       endDateTime,
//       timezone,
//       location,
//       image { asset-> { url } },
//       description
//     }`,
//     {},
//     {
//       next: {
//         revalidate: cache.short, // Conferences cambian frecuentemente
//         tags: ["conference"],
//       },
//     }
//   );

//   // 🧹 Limpiar timezones corruptos en todas las conferences
//   return conferences.map((conference: SanityConference) => ({
//     ...conference,
//     timezone: cleanTimezone(conference.timezone),
//   }));
// }

// apps/web/lib/sanity/queries.ts
export async function getConferences(
  lang: "en" | "es" = "en"
): Promise<SanityConference[]> {
  const sanityClient = getClient({ forceFresh: isDevelopment });

  const conferences = await sanityClient.fetch(
    /* groq */ `
      *[_type == "conference"] | order(startDateTime asc) {
        _id,
        "title"      : coalesce(title[$lang],      title.en),
        "description": coalesce(description[$lang],description.en),
        slug,
        startDateTime,
        endDateTime,
        timezone,
        location,
        image { asset->{ url } }
      }
    `,
    { lang },
    {
      next: {
        revalidate: cache.short, // siguen cambiando frecuentemente
        tags: ["conference"],
      },
    }
  );

  // 🧹 Normaliza timezones mal formados
  return (conferences as SanityConference[]).map((conf) => ({
    ...conf,
    timezone: cleanTimezone(conf.timezone),
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

// export async function getConferenceBySlug(slug: string) {
//   const query = `*[_type == "conference" && slug.current == $slug][0] {
//     _id,
//     title,
//     description,
//     startDateTime,
//     endDateTime,
//     timezone,
//     location,
//     category,
//     price,
//     "organizer": {
//       "name": organizer.name,
//       "logo": organizer.logo.asset->url
//     },
//     "slug": slug.current,
//     "image": {
//       "asset": {
//         "url": image.asset->url
//       }
//     },
//     about[] {
//       ...,
//       _type == "inlineImage" => {
//         ...,
//         asset-> {
//           url,
//           metadata {
//             dimensions {
//               width,
//               height
//             }
//           }
//         }
//       },
//       _type == "videoEmbed" => {
//         ...,
//         url,
//         title,
//         caption
//       },
//       _type == "callout" => {
//         ...,
//         type,
//         title,
//         content
//       },
//       _type == "divider" => {
//         ...,
//         style
//       },
//       _type == "columns" => {
//         ...,
//         leftColumn,
//         rightColumn
//       }
//     },
//     speakers[] {
//       _id,
//       name,
//       role,
//       "image": {
//         "asset": {
//           "url": image.asset->url
//         }
//       }
//     },
//     "gallery": gallery[].asset->{
//       "url": url
//     },
//     "relatedCampaign": relatedCampaign->{
//       _id,
//       title,
//       "slug": slug.current
//     }
//   }`;

//   const sanityClient = getClient({ forceFresh: isDevelopment });
//   const event = await sanityClient.fetch(
//     query,
//     { slug },
//     {
//       next: {
//         revalidate: cache.short, // Conferences pueden cambiar frecuentemente
//         tags: ["conference", `conference-${slug}`],
//       },
//     }
//   );

//   // 🧹 Limpiar timezone corrupto si existe el evento
//   if (event && event.timezone) {
//     return {
//       ...event,
//       timezone: cleanTimezone(event.timezone),
//     };
//   }

//   return event;
// }

// apps/web/lib/sanity/queries.ts
export async function getConferenceBySlug(
  slug: string,
  lang: "en" | "es" = "en"
): Promise<SanityConference | null> {
  const query = /* groq */ `
    *[_type == "conference" && slug.current == $slug][0]{
      _id,

      "title"      : coalesce(title[$lang],      title.en),
      "description": coalesce(description[$lang],description.en),
      "location"   : coalesce(location[$lang],   location.en),

      startDateTime,
      endDateTime,
      timezone,
      category,
      price,

      "organizer": {
        "name": coalesce(organizer.name[$lang], organizer.name.en),
        "logo": organizer.logo.asset->url
      },

      "slug": slug.current,

      image{ asset->{ url } },

      about[],

      speakers[]{
        _id,
        "name": coalesce(name[$lang], name.en),
        "role": coalesce(role[$lang], role.en),
        "image": { "asset": { "url": image.asset->url } }
      },

      "gallery": gallery[].asset->{ url },

      "relatedCampaign": relatedCampaign->{
        _id,
        "title": coalesce(title[$lang], title.en),
        "slug": slug.current
      }
    }
  `;

  const sanityClient = getClient({ forceFresh: isDevelopment });

  const event = await sanityClient.fetch(
    query,
    { slug, lang },
    {
      next: {
        revalidate: cache.short, // ⏱  quick ISR
        tags: ["conference", `conference-${slug}`],
      },
    }
  );

  return event ? { ...event, timezone: cleanTimezone(event.timezone) } : null;
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
export const ABOUT_PAGE_QUERY = /* groq */ `
*[_type == "aboutPage"][0]{
  _id,
  title,

  heroSection{
    "heroHeading"   : coalesce(heroHeading[$lang],   heroHeading.en),
    "heroSubheading": coalesce(heroSubheading[$lang],heroSubheading.en),
    "heroBgImage"   : heroBgImage.asset->url
  },

  whoWeAreSection{
    "whoWeAreHeading"        : coalesce(whoWeAreHeading[$lang],        whoWeAreHeading.en),
    "whoWeAreFirstParagraph" : coalesce(whoWeAreFirstParagraph[$lang], whoWeAreFirstParagraph.en),
    "whoWeAreImage"          : whoWeAreImage.asset->url,
    "whoWeAreSecondParagraph": coalesce(whoWeAreSecondParagraph[$lang],whoWeAreSecondParagraph.en),
    "whoWeAreThirdParagraph" : coalesce(whoWeAreThirdParagraph[$lang], whoWeAreThirdParagraph.en)
  },

  ourMissionSection{
    "ourMissionHeading" : coalesce(ourMissionHeading[$lang],  ourMissionHeading.en),
    "ourMissionParagraph": coalesce(ourMissionParagraph[$lang],ourMissionParagraph.en),
    "ourMissionImage"   : ourMissionImage.asset->url
  },

  ourPhilosophySection{
    "ourPhilosophyHeading" : coalesce(ourPhilosophyHeading[$lang], ourPhilosophyHeading.en),
    "ourPhilosophyParagraph": coalesce(ourPhilosophyParagraph[$lang],ourPhilosophyParagraph.en),
    "ourPhilosophyImage"   : ourPhilosophyImage.asset->url
  },

  ourCharterSection{
    "ourCharterHeading" : coalesce(ourCharterHeading[$lang], ourCharterHeading.en),
    "ourCharterParagraph": coalesce(ourCharterParagraph[$lang],ourCharterParagraph.en),
    "charterPrinciples"  : charterPrinciples[]{
      "title": coalesce(title[$lang], title.en)
    }
  },

  missionHighlightCard{
    "title"      : coalesce(title[$lang],      title.en),
    "description": coalesce(description[$lang],description.en)
  },

  getInTouchCard{
    "getInTouchHeading": coalesce(getInTouchHeading[$lang],getInTouchHeading.en),
    contactInformation->{
      title, email, phone, address,
      socialMedia[]{platform,url}
    }
  },

  ourCommitmentCard{
    "title"      : coalesce(title[$lang],      title.en),
    "description": coalesce(description[$lang],description.en)
  }
}
`;

export async function getAboutPageData(
  lang: "en" | "es" = "en"
): Promise<SanityAboutPage> {
  try {
    logger.log("[Sanity] Fetching About Page data");

    const sanityClient = getClient({ forceFresh: isDevelopment });

    const data: SanityAboutPage = await sanityClient.fetch(
      ABOUT_PAGE_QUERY,
      { lang },
      {
        next: {
          revalidate: cache.medium,
          tags: ["aboutPage"],
        },
      }
    );

    if (!data) throw new Error("No About Page data found in Sanity");

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

// lib/sanity/queries/volunteerPage.ts
export const VOLUNTEER_PAGE_QUERY = /* groq */ `
*[_type == "volunteerPage"][0]{
  _id,
  title,

  heroSection{
    "heroHeading"   : coalesce(heroHeading[$lang],   heroHeading.en),
    "heroSubheading": coalesce(heroSubheading[$lang],heroSubheading.en),
    "heroButtonText": coalesce(heroButtonText[$lang],heroButtonText.en),
    "heroBgImage"   : heroBgImage.asset->url
  },

  waysToVolunteerSection{
    "heading"  : coalesce(waysToVolunteerHeading[$lang],  waysToVolunteerHeading.en),
    "paragraph": coalesce(waysToVolunteerParagraph[$lang],waysToVolunteerParagraph.en)
  },

  convinceHighProfileSection{
    "heading"  : coalesce(convinceHighProfileHeading[$lang],  convinceHighProfileHeading.en),
    "paragraph": coalesce(convinceHighProfileParagraph[$lang],convinceHighProfileParagraph.en),
    "checklist": convinceHighProfileChecklist[]{
      "title": coalesce(title[$lang], title.en)
    },
    "image": convinceHighProfileImage.asset->url
  },

  spreadTheWordSection{
    "heading"  : coalesce(spreadTheWordHeading[$lang],  spreadTheWordHeading.en),
    "paragraph": coalesce(spreadTheWordParagraph[$lang],spreadTheWordParagraph.en),
    "cards"    : spreadTheWordCards[]{
      "title"      : coalesce(title[$lang],      title.en),
      "description": coalesce(description[$lang],description.en)
    },
    "image": spreadTheWordImage.asset->url
  },

  impactSection{
    "heading"    : coalesce(impactHeading[$lang],    impactHeading.en),
    "paragraph"  : coalesce(impactParagraph[$lang],  impactParagraph.en),
    "buttonText" : coalesce(impactButtonText[$lang], impactButtonText.en)
  }
}
`;

export async function getVolunteerPageData(
  lang: "en" | "es" = "en"
): Promise<SanityVolunteerPage> {
  try {
    logger.log("[Sanity] Fetching Volunteer Page data");
    const sanityClient = getClient({ forceFresh: isDevelopment });

    const data: SanityVolunteerPage = await sanityClient.fetch(
      VOLUNTEER_PAGE_QUERY,
      { lang },
      {
        next: {
          revalidate: cache.medium,
          tags: ["volunteerPage"],
        },
      }
    );

    if (!data) throw new Error("No Volunteer Page data found in Sanity");

    logger.log("[Sanity] Successfully fetched Volunteer Page data");
    return data;
  } catch (error) {
    logger.error("[Sanity Error] Failed to fetch Volunteer Page data:", error);
    throw error;
  }
}

// /**
//  * Sanity queries for localized content
//  */

// // Get home page content with localized fields
// export const homePageQuery = `
//   *[_type == "homePage"][0] {
//     heroHeading,
//     heroSubheading,
//     heroPrimaryButtonText,
//     heroSecondaryButtonText,
//     heroImage {
//       asset->{
//         _id,
//         url
//       }
//     },
//     howItWorksHeading,
//     howItWorksDescription,
//     howItWorksSteps[] {
//       title,
//       description
//     },
//     campaignsHeading,
//     campaignsDescription,
//     campaigns[]->
//   }
// `;

// // Get about page content with localized fields
// export const aboutPageQuery = `
//   *[_type == "aboutPage"][0] {
//     heroSection {
//       heroHeading,
//       heroSubheading,
//       heroBgImage {
//         asset->{
//           _id,
//           url
//         }
//       }
//     },
//     whoWeAreSection {
//       whoWeAreHeading,
//       whoWeAreFirstParagraph,
//       whoWeAreSecondParagraph,
//       whoWeAreThirdParagraph,
//       whoWeAreImage {
//         asset->{
//           _id,
//           url
//         }
//       }
//     },
//     ourMissionSection {
//       ourMissionHeading,
//       ourMissionParagraph,
//       ourMissionImage {
//         asset->{
//           _id,
//           url
//         }
//       }
//     },
//     ourPhilosophySection {
//       ourPhilosophyHeading,
//       ourPhilosophyParagraph,
//       ourPhilosophyImage {
//         asset->{
//           _id,
//           url
//         }
//       }
//     }
//   }
// `;

// // Get article by slug with localized fields
// export const articleBySlugQuery = `
//   *[_type == "article" && slug.current == $slug][0] {
//     title,
//     slug,
//     publishedAt,
//     excerpt,
//     image {
//       asset->{
//         _id,
//         url
//       }
//     },
//     content,
//     author->,
//     categories[]->,
//     seo
//   }
// `;

// // Get all articles with localized fields
// export const allArticlesQuery = `
//   *[_type == "article"] | order(publishedAt desc) {
//     title,
//     slug,
//     publishedAt,
//     excerpt,
//     image {
//       asset->{
//         _id,
//         url
//       }
//     },
//     author->,
//     categories[]->
//   }
// `;

// //-------------------------------------------------------------------
// // Helper functions that wrap the GROQ above and inject the $lang param
// //-------------------------------------------------------------------

// import { getClient } from "./client";
// import { cleanTimezone } from "@/lib/utils/clean-timezone";

// /**
//  * Fetches all sections of the Home Page already filtered by language.
//  * It keeps the original shape expected by the components (heroSection, campaignsSection, …).
//  */
// export async function getHomePageData(lang: "en" | "es" = "en") {
//   const sanity = getClient();

//   // Full query with language projections
//   const query = /* groq */ `
//     *[_type=="homePage"][0]{
//       // HERO SECTION ---------------------------------
//       "heroSection": {
//         "heroHeading": heroHeading[$lang],
//         "heroSubheading": heroSubheading[$lang],
//         "heroPrimaryButtonText": heroPrimaryButtonText[$lang],
//         "heroSecondaryButtonText": heroSecondaryButtonText[$lang],
//         heroVideo,
//         heroImage{asset->{url}}
//       },

//       // HOW-IT-WORKS ---------------------------------
//       "howItWorksSection": {
//         "howItWorksHeading": howItWorksHeading[$lang],
//         "howItWorksDescription": howItWorksDescription[$lang],
//         "howItWorksSteps": howItWorksSteps[]{
//           "title": title[$lang],
//           "description": description[$lang],
//           icon
//         }
//       },

//       // CAMPAIGNS ------------------------------------
//       "campaignsSection": {
//         "campaignsHeading": campaignsHeading[$lang],
//         "campaignsDescription": campaignsDescription[$lang],
//         "campaigns": campaigns[]->{
//           _id,
//           slug,
//           category,
//           goalPledges,
//           "title": title[$lang],
//           "description": description[$lang],
//           featuredImage{asset->{url}}
//         }
//       },

//       // WAYS TO SUPPORT ------------------------------
//       "waysToSupportSection": {
//         "waysToSupportHeading": waysToSupportHeading[$lang],
//         "waysToSupportDescription": waysToSupportDescription[$lang],
//         secondCardHeading[$lang],
//         secondCardDescription[$lang],
//         secondCardButtonText[$lang],
//         secondCardSecondHeading[$lang],
//         secondCardListOfSupportImpact,
//         "waysToSupportItems": waysToSupportItems[]{
//           icon{asset->{url}},
//           "title": title[$lang],
//           "description": description[$lang],
//           buttonText[$lang],
//           buttonLink
//         }
//       },

//       // ARTICLES -------------------------------------
//       "articlesSection": {
//         "articlesHeading": articlesHeading[$lang],
//         "articlesDescription": articlesDescription[$lang],
//         "articles": articles[]->{
//           _id,
//           slug,
//           publishedAt,
//           "title": title[$lang],
//           "excerpt": excerpt[$lang],
//           image{asset->{url}}
//         }
//       },

//       // CONFERENCES ----------------------------------
//       "conferencesSection": {
//         "conferencesHeading": conferencesHeading[$lang],
//         "conferencesDescription": conferencesDescription[$lang],
//         "conferences": conferences[]->{
//           _id,
//           slug,
//           startDateTime,
//           endDateTime,
//           timezone,
//           location,
//           image{asset->{url}},
//           "title": title[$lang],
//           "description": description[$lang]
//         }
//       }
//     }`;

//   const data = await sanity.fetch(query, { lang });

//   // Normalise timezone values
//   if (data?.conferencesSection?.conferences) {
//     data.conferencesSection.conferences =
//       data.conferencesSection.conferences.map((c: any) => ({
//         ...c,
//         timezone: cleanTimezone(c.timezone),
//       }));
//   }

//   return data;
// }

// /**
//  * Fetches the About Page with localized fields.
//  */
// export async function getAboutPageData(lang: "en" | "es" = "en") {
//   const sanity = getClient();

//   const query = /* groq */ `
//     *[_type=="aboutPage"][0]{
//       "heroSection": {
//         "heroHeading": heroSection.heroHeading[$lang],
//         "heroSubheading": heroSection.heroSubheading[$lang],
//         heroSection.heroBgImage{asset->{url}}
//       },
//       "whoWeAreSection": {
//         "whoWeAreHeading": whoWeAreSection.whoWeAreHeading[$lang],
//         "whoWeAreFirstParagraph": whoWeAreSection.whoWeAreFirstParagraph[$lang],
//         "whoWeAreSecondParagraph": whoWeAreSection.whoWeAreSecondParagraph[$lang],
//         "whoWeAreThirdParagraph": whoWeAreSection.whoWeAreThirdParagraph[$lang],
//         whoWeAreSection.whoWeAreImage{asset->{url}}
//       },
//       "ourMissionSection": {
//         "ourMissionHeading": ourMissionSection.ourMissionHeading[$lang],
//         "ourMissionParagraph": ourMissionSection.ourMissionParagraph[$lang],
//         ourMissionSection.ourMissionImage{asset->{url}}
//       },
//       "ourPhilosophySection": {
//         "ourPhilosophyHeading": ourPhilosophySection.ourPhilosophyHeading[$lang],
//         "ourPhilosophyParagraph": ourPhilosophySection.ourPhilosophyParagraph[$lang],
//         ourPhilosophySection.ourPhilosophyImage{asset->{url}}
//       },
//       "ourCharterSection": {
//         ourCharterHeading[$lang],
//         ourCharterParagraph[$lang],
//         charterPrinciples[]{
//           "title": title[$lang]
//         }
//       }
//     }`;

//   return sanity.fetch(query, { lang });
// }

// /**
//  * Fetches Volunteer Page with localized fields.
//  */
// export async function getVolunteerPageData(lang: "en" | "es" = "en") {
//   const sanity = getClient();

//   const query = /* groq */ `
//     *[_type=="volunteerPage"][0]{
//       "heroSection": {
//         "heroHeading": heroSection.heroHeading[$lang],
//         "heroSubheading": heroSection.heroSubheading[$lang],
//         heroSection.heroButtonText[$lang],
//         heroSection.heroBgImage{asset->{url}}
//       },
//       "waysToVolunteerSection": {
//         "waysToVolunteerHeading": waysToVolunteerSection.waysToVolunteerHeading[$lang],
//         "waysToVolunteerParagraph": waysToVolunteerSection.waysToVolunteerParagraph[$lang]
//       },
//       "convinceHighProfileSection": {
//         "convinceHighProfileHeading": convinceHighProfileSection.convinceHighProfileHeading[$lang],
//         "convinceHighProfileParagraph": convinceHighProfileSection.convinceHighProfileParagraph[$lang],
//         convinceHighProfileSection.convinceHighProfileChecklist[]{"title": title[$lang]},
//         convinceHighProfileSection.convinceHighProfileImage{asset->{url}}
//       },
//       "spreadTheWordSection": {
//         "spreadTheWordHeading": spreadTheWordSection.spreadTheWordHeading[$lang],
//         "spreadTheWordParagraph": spreadTheWordSection.spreadTheWordParagraph[$lang],
//         spreadTheWordSection.spreadTheWordCards[]{
//           "title": title[$lang],
//           "description": description[$lang]
//         },
//         spreadTheWordSection.spreadTheWordImage{asset->{url}}
//       },
//       "impactSection": {
//         impactHeading[$lang],
//         impactParagraph[$lang],
//         impactButtonText[$lang]
//       }
//     }`;

//   return sanity.fetch(query, { lang });
// }

// /**
//  * Fetches a campaign by slug with localized title/description (other fields unchanged).
//  */
// export async function getCampaignBySlug(
//   slug: string,
//   lang: "en" | "es" = "en"
// ) {
//   if (!slug) return null;
//   const sanity = getClient();

//   const query = /* groq */ `
//     *[_type=="campaign" && slug.current==$slug][0]{
//       _id,
//       slug,
//       category,
//       goalPledges,
//       "title": title[$lang],
//       "description": description[$lang],
//       featuredImage{asset->{url}},
//       parties[]{
//         _key,
//         slug,
//         color,
//         solutionLimit,
//         "name": name[$lang],
//         "description": description[$lang]
//       }
//     }`;

//   return sanity.fetch(query, { slug, lang });
// }
