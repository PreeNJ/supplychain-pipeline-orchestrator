import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  env: {
    N8N_HOST: process.env.N8N_HOST,
  },

  allowedDevOrigins: [
    'http://bentley.tail37bd09.ts.net',
    'https://bentley.tail37bd09.ts.net',
  ],

  experimental: {

  },
};

export default nextConfig;