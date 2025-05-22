// lib/sanity/queries.ts
import { client } from "./client";

// Consulta para obtener contenido de la página de inicio
export async function getHomePageData() {
  return client.fetch(
    `
    *[_type == "homePage"][0] {
      heroHeading,
      heroSubheading,
      heroPrimaryButtonText,
      heroSecondaryButtonText,
      heroImage {
        asset-> {
          url
        }
      },
      heroVideo {
        asset-> {
          url
        }
      }
    }
  `,
    {},
    { next: { revalidate: 60 } }
  ); // Revalidar cada 60 segundos
}
