// apps/web/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Excluye api, _next, _vercel, embeds y archivos con extensión
  matcher: ['/((?!api|_next|_vercel|embeds|.*\\..*).*)'],
};
