import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema/*",
  out: "./src/db/migrations",
  driver: "d1",
  dbCredentials: {
    wranglerConfigPath: "./wrangler.jsonc",
    dbName: "pledge4peace-db",
  },
} satisfies Config;
