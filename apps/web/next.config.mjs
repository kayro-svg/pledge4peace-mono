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
}

export default nextConfig
