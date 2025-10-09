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

      "heroHeading":  coalesce(heroHeading[$lang],heroHeading.en),
      "heroSubheading":  coalesce(heroSubheading[$lang],heroSubheading.en),
      "heroPrimaryButtonText":  coalesce(heroPrimaryButtonText[$lang],heroPrimaryButtonText.en),
      "heroSecondaryButtonText":  coalesce(heroSecondaryButtonText[$lang],heroSecondaryButtonText.en),
      heroVideo { asset-> { url } },
      heroImage { asset-> { url } },
      
      "howItWorksHeading":  coalesce(howItWorksHeading[$lang],howItWorksHeading.en),
      "howItWorksDescription":  coalesce(howItWorksDescription[$lang],howItWorksDescription.en),
      howItWorksSteps[] {
        "title": coalesce(title[$lang],title.en),
        "description": coalesce(description[$lang],description.en)
      },
      
      "campaignsHeading":  coalesce(campaignsHeading[$lang],campaignsHeading.en),
      "campaignsDescription":  coalesce(campaignsDescription[$lang],campaignsDescription.en),
   campaigns[]-> {
  _id,
  title,
  slug,
  category,
  description,
  goalPledges,
  featuredImage { asset-> { url } },
},
      
      "waysToSupportHeading":  coalesce(waysToSupportHeading[$lang],waysToSupportHeading.en),
      "waysToSupportDescription":  coalesce(waysToSupportDescription[$lang],waysToSupportDescription.en),
      waysToSupportItems[] {
        "title": title[$lang],
        "description": description[$lang],
        icon { asset-> { url } },
        buttonText,
        buttonLink
      },
      
      "articlesHeading":  coalesce(articlesHeading[$lang],articlesHeading.en),
      "articlesDescription":  coalesce(articlesDescription[$lang],articlesDescription.en),
      articles[]-> {
        _id,
        "title": coalesce(title[$lang],title.en),
        slug,
        publishedAt,
        "excerpt": coalesce(excerpt[$lang],excerpt.en),
        image { asset-> { url } }
      },
      
      "conferencesHeading":  coalesce(conferencesHeading[$lang],conferencesHeading.en),
      "conferencesDescription":  coalesce(conferencesDescription[$lang],conferencesDescription.en),
      conferences[]-> {
        _id,
        "title": coalesce(title[$lang],title.en),
        slug,
        startDateTime,
        endDateTime,
        timezone,
        location,
        image { asset-> { url } },
        "description": coalesce(description[$lang],description.en)
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

export async function getCampaignBySlug(
  slug: string,
  lang: "en" | "es" = "en"
): Promise<SanityCampaign> {
  try {
    logger.log(`[Sanity] Fetching campaign data for: ${slug}`);

    // 🚀 Usar cliente inteligente por entorno
    const sanityClient = getClient({ forceFresh: isDevelopment });

    // Restore the original query structure to match your existing data
    const campaignData = await sanityClient.fetch(
      `*[_type == "campaign" && slug.current == $slug][0] {
        _id,
        "title": coalesce(title[$lang], title.en),
        slug,
        category,
        "description": coalesce(description[$lang], description.en),
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
          "name": coalesce(name[$lang], name.en),
          slug,
          "description": coalesce(description[$lang], description.en),
          icon { asset-> { url } },
          color,
          solutionLimit
        },
        solutionsSection {
          heading,
          introParagraphs[] {
              ...,
              _type == "reference" => @->{
                _type,
                _id,
                "slug": slug.current,
                html,
                height
              },
              _type == "brevoFormRef" => @->{
                _type,
                _id,
                "slug": slug.current,
                html,
                height
              },
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
            "title": coalesce(title[$lang], title.en), 
            slug, 
            startDateTime,
            endDateTime,
            timezone,
            "location": coalesce(location[$lang], location.en), 
            image { asset-> { url } }, 
            "description": coalesce(description[$lang], description.en),
            about[] {
              ...,
              _type == "reference" => @->{
                _type,
                _id,
                "slug": slug.current,
                html,
                height
              },
              _type == "brevoFormRef" => @->{
                _type,
                _id,
                "slug": slug.current,
                html,
                height
              },
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
              "name": coalesce(name[$lang], name.en),
              "role": coalesce(role[$lang], role.en),
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
      { slug, lang },
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

export async function getCampaignForDashboard(
  id: string,
  lang: "en" | "es" = "en"
): Promise<{
  title: string;
  id: string;
  slug: string;
}> {
  const sanityClient = getClient({ forceFresh: isDevelopment });
  const campaignTitle = await sanityClient.fetch(
    `*[_type == "campaign" && _id == $id][0] {
      _id,
      "title": coalesce(title[$lang],title.en),
      slug { current }
    }`,
    { id, lang },
    {
      // ⚡ Cache inteligente por entorno para evitar que se haga la consulta cada vez que se renderiza el componente
      next: {
        revalidate: cache.long,
        tags: ["campaign", `campaign-${id}`],
      },
    }
  );
  return {
    title: campaignTitle?.title,
    id: campaignTitle?._id,
    slug: campaignTitle?.slug.current,
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

// Slim slug map for client consumers that only need id->slug
export async function getCampaignIdSlugMap(
  lang: "en" | "es" = "en"
): Promise<Record<string, string>> {
  const sanityClient = getClient({ forceFresh: isDevelopment });
  const rows = await sanityClient.fetch(
    /* groq */ `
      *[_type == "campaign" && defined(slug.current)]{
        _id,
        "slug": slug.current
      }
    `,
    { lang },
    {
      next: {
        revalidate: cache.long,
        tags: ["campaign", "campaign-slug-map"],
      },
    }
  );
  const map: Record<string, string> = {};
  for (const r of rows as Array<{ _id: string; slug: string }>) {
    if (r?._id && r?.slug) map[r._id] = r.slug;
  }
  return map;
}

export async function getArticles(
  limit?: number,
  lang: "en" | "es" = "en"
): Promise<SanityArticle[]> {
  // 🚀 Usar cliente inteligente por entorno
  const sanityClient = getClient({ forceFresh: isDevelopment });

  return sanityClient.fetch(
    `*[_type == "article"] | order(publishedAt desc) ${
      limit ? `[0..${limit}]` : ""
    } {
      _id,
      "title"      : coalesce(title[$lang],      title.en),
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
      "excerpt": coalesce(excerpt[$lang],excerpt.en),
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
        "title": coalesce(title[$lang],title.en)
      }
    }`,
    { lang },
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
        "location": coalesce(location[$lang],location.en),
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

export async function getArticleBySlug(
  slug: string,
  lang: "en" | "es" = "en"
): Promise<{
  article: SanityArticle;
  relatedArticles: SanityArticle[];
}> {
  // 🚀 Usar cliente inteligente por entorno
  const sanityClient = getClient({ forceFresh: isDevelopment });

  return sanityClient.fetch(
    `{
      "article": *[_type == "article" && slug.current == $slug][0] {
        _id,
        "title": coalesce(title[$lang],title.en),
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
        "excerpt": coalesce(excerpt[$lang],excerpt.en),
        seo {
          "metaTitle" : coalesce(metaTitle[$lang],metaTitle.en),
          "metaDescription" : coalesce(metaDescription[$lang],metaDescription.en),
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
          _type == "reference" => @->{
            _type,
            _id,
            "slug": slug.current,
            html,
            height
          },
          _type == "brevoFormRef" => @->{
            _type,
            _id,
            "slug": slug.current,
            html,
            height
          },
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
          "title": coalesce(title[$lang],title.en)
        }
      },
      "relatedArticles": *[_type == "article" && slug.current != $slug && count(categories[@._ref in *[_type == "article" && slug.current == $slug][0].categories[]._ref]) > 0] | order(publishedAt desc)[0...3] {
        _id,
        "title": coalesce(title[$lang],title.en),
        slug { current },
        publishedAt,
        image { 
          asset-> { 
            url
          }
        },
        "excerpt": coalesce(excerpt[$lang],excerpt.en),
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
          "title": coalesce(title[$lang],title.en)
        }
      }
    }`,
    { slug, lang },
    {
      next: {
        revalidate: cache.medium, // ⚡ Cache inteligente por entorno
        tags: ["article", `article-${slug}`],
      },
    }
  );
}

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

      about[]{
        ...,
        _type == "reference" => @->{
          _type,
          _id,
          "slug": slug.current,
          html,
          height
        },
        _type == "brevoFormRef" => @->{
          _type,
          _id,
          "slug": slug.current,
          html,
          height
        }
      },

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

/** Peace Seal Home Page */
export async function getPeaceSealHomePage(
  lang: "en" | "es" = "en"
): Promise<any> {
  const sanityClient = getClient({ forceFresh: isDevelopment });

  return sanityClient.fetch(
    /* groq */ `
*[_type == "peaceSealHomePage"][0]{
  _id,

  "heroTagline":            coalesce(heroTagline[$lang],            heroTagline.en),
  "heroHeading":            coalesce(heroHeading[$lang],            heroHeading.en),
  "heroSubheading":         coalesce(heroSubheading[$lang],         heroSubheading.en),
  "heroDescription":        coalesce(heroDescription[$lang],        heroDescription.en),
  "heroPrimaryButtonText":  coalesce(heroPrimaryButtonText[$lang],  heroPrimaryButtonText.en),
  heroPrimaryButtonLink,
  heroVideo{asset->{url}},
  heroImage{asset->{url}},

  
  "valueHeadingLines": valueHeadingLines[]{
    "text": coalesce(@[$lang], @.en)
  },
  "valueParagraph": coalesce(valueParagraph[$lang], valueParagraph.en),
  valueImage{asset->{url}},

  
  "whatIsHeadingTop":  coalesce(whatIsHeadingTop[$lang],  whatIsHeadingTop.en),
  "whatIsHeadingMain": coalesce(whatIsHeadingMain[$lang], whatIsHeadingMain.en),
  "whatIsDescription": coalesce(whatIsDescription[$lang], whatIsDescription.en),
  whatIsVideoId,
  whatIsVideoPoster{asset->{url}},

  
  "whyNeedsTitle": coalesce(whyNeedsTitle[$lang], whyNeedsTitle.en),
  "whyNeedsFeatures": whyNeedsFeatures[]{
    icon{asset->{url}},
    "title": coalesce(title[$lang], title.en),
    "text":  coalesce(text[$lang],  text.en)
  },

  
  "howItWorksHeading": coalesce(howItWorksHeading[$lang], howItWorksHeading.en),
  "howItWorksSteps": howItWorksSteps[]{
    index,
    icon{asset->{url}},
    "title": coalesce(title[$lang], title.en),
    "text":  coalesce(text[$lang],  text.en)
  },

  
  "rewardsTitle":       coalesce(rewardsTitle[$lang],       rewardsTitle.en),
  "rewardsDescription": coalesce(rewardsDescription[$lang], rewardsDescription.en),
  rewardsVideoId,
  rewardsVideoPoster{asset->{url}},
  "perks": perks[]{
    icon{asset->{url}},
    "label": coalesce(label[$lang], label.en)
  },
  "startFreeAssessmentTitle":       coalesce(startFreeAssessmentTitle[$lang],       startFreeAssessmentTitle.en),
  "startFreeAssessmentDescription": coalesce(startFreeAssessmentDescription[$lang], startFreeAssessmentDescription.en),
  "startFreeAssessmentPros": startFreeAssessmentPros[]{"text": coalesce(@[$lang], @.en)},
  "startFreeAssessmentButtonText":  coalesce(startFreeAssessmentButtonText[$lang],  startFreeAssessmentButtonText.en),


  "advantageTitle":       coalesce(advantageTitle[$lang],       advantageTitle.en),
  "advantageDescription": coalesce(advantageDescription[$lang], advantageDescription.en),
  "withoutTitle":         coalesce(withoutTitle[$lang],         withoutTitle.en),
  "withoutItems":         withoutItems[]{"text": coalesce(@[$lang], @.en)},
  "withTitle":            coalesce(withTitle[$lang],            withTitle.en),
  "withItems":            withItems[]{"text": coalesce(@[$lang], @.en)},

  "finalCtaTitle":       coalesce(finalCtaTitle[$lang],       finalCtaTitle.en),
  "finalCtaDescription": coalesce(finalCtaDescription[$lang], finalCtaDescription.en),
  "finalCtaButtonText":  coalesce(finalCtaButtonText[$lang],  finalCtaButtonText.en)
}
    `,
    { lang },
    {
      next: { revalidate: cache.long, tags: ["peaceSealHomePage"] },
    }
  );
}
