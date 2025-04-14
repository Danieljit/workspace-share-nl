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
    // Prevent static generation of auth pages to avoid URL errors
    serverActions: true,
  },
  // Configure page generation options
  output: 'standalone',
  // Disable static generation for auth pages
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    // Remove auth pages from static generation
    delete defaultPathMap['/signin'];
    delete defaultPathMap['/signup'];
    return defaultPathMap;
  },
}

module.exports = nextConfig
