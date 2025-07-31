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
    unoptimized: true,
  },
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', '@radix-ui/*'],
  },
  // Remove console statements in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'] // Keep console.error for important errors
    } : false,
  },
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
}

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
