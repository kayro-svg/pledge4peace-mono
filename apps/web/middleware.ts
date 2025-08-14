import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

// Configure the matcher to exclude static files, API routes, etc.
export const config = {
  // Exclude api, next internals, static files, and custom embed routes
  matcher: ["/((?!api|_next|embeds|.*\\..*).*)"],
};
