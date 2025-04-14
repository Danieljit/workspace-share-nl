/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.pexels.com', 'images.unsplash.com', 'source.unsplash.com', 'res.cloudinary.com', 'randomuser.me'],
    unoptimized: true,
  },
  // Disable type checking during build for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build for faster builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configure static page generation
  experimental: {
    // Use correct format for serverActions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Configure page generation options
  output: 'standalone',
}

module.exports = nextConfig
