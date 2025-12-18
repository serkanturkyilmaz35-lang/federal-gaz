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

  // Vercel Memory Optimization
  // Externalize heavy packages to reduce serverless bundle size
  serverExternalPackages: ['sequelize', 'mysql2', 'bcrypt', 'xlsx', 'jspdf'],

  // Empty turbopack config to allow build with webpack fallback
  turbopack: {},
};

export default nextConfig;
