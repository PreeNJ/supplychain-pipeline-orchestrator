import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    N8N_HOST: process.env.N8N_HOST,
  },
};

export default nextConfig;