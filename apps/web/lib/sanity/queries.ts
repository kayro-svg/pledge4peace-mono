// lib/sanity/queries.ts
import { client } from "./client";
import {
  SanityHomePage,
  SanityCampaign,
  SanityArticle,
  SanityConference,
  SanitySlug,
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
        date,
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

export async function getCampaignBySlug(slug: string): Promise<SanityCampaign> {
  return client.fetch(
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
          date, 
          location, 
          image { asset-> { url } }, 
          description,
          about,
          category,
          price,
          registrationLink,
          organizer,
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
}

export async function getCampaignSlugs(): Promise<SanitySlug[]> {
  return client.fetch(
    `*[_type == "campaign" && defined(slug.current)] {
      slug
    }`,
    {},
    { next: { revalidate: 60 } }
  );
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
    `*[_type == "conference"] | order(date asc) {
      _id,
      title,
      slug,
      date,
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
        content,
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
    date,
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
    about,
    registrationLink,
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
