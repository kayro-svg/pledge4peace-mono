import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema/*",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/0244209a5165aabd943d353a2f17f0e2025a17f114aa1dddda636b0e9756de24.sqlite",
  },
});

// import type { Config } from "drizzle-kit";

// export default {
//   schema: "./src/db/schema/*",
//   out: "./src/db/migrations",
//   driver: "d1-http",
//   dbCredentials: {
//     // wranglerConfigPath: "./wrangler.jsonc",
//     url: "/Users/kayro/Documents/projects/pledge4peace-mono/apps/api/.wrangler/state/v3/d1/miniflare-D1DatabaseObject",
//     dbName: "preview-pledge4peace-db",
//   },
// } satisfies Config;
