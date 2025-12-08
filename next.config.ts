import type { NextConfig } from "next";

const nextConfig: any = {
  images: {
    unoptimized: true,
  },

  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  /* config options here */
};

export default nextConfig;
