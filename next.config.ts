import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  turbopack: {},
  /* config options here */
  webpack: (config) => {
    config.externals.push({
      'pg-hstore': 'commonjs pg-hstore',
      'pg': 'commonjs pg',
      'sqlite3': 'commonjs sqlite3',
      'tedious': 'commonjs tedious',
      'oracledb': 'commonjs oracledb',
      'mysql2': 'commonjs mysql2',
    });
    return config;
  },
};

export default nextConfig;
