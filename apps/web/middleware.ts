import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

// Configure the matcher to exclude static files, API routes, etc.
export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
