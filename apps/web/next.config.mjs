import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */


const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.sanity.io' },
    ],
    // Vercel automatically handles WebP/AVIF, but we can specify preference
    formats: ['image/webp', 'image/avif'],
    // Use Vercel's recommended device sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Vercel handles caching, but we can set minimum TTL
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week (more conservative than 1 year)
    // SVG handling (be cautious with this)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    // Optimize package imports (Vercel compatible)
    optimizePackageImports: ['lucide-react', '@radix-ui/*'],
    // Note: Removed turbo config as Vercel handles bundling optimally
    // Note: Removed optimizeCss as Vercel already optimizes CSS
    // Note: Removed swcMinify as Vercel uses SWC by default
  },
  // Remove console statements in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'] // Keep console.error for important errors
    } : false,
  },
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev', '1b09a9b8b99f.ngrok-free.app'],
}

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
