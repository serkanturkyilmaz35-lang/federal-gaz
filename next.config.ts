import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },

  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },

  // Externalize heavy packages to reduce serverless bundle size
  serverExternalPackages: ['sequelize', 'mysql2', 'bcrypt', 'xlsx', 'jspdf', 'sharp'],

  // Enable compression
  compress: true,

  // Reduce build output
  productionBrowserSourceMaps: false,

  // Optimize for Netlify - pre-render static pages
  output: 'standalone',

  // Headers for caching static assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },

  // Empty turbopack config to allow build with webpack fallback
  turbopack: {},
};

export default nextConfig;
