import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Improve serverless function performance
    serverMinification: false,
  },
};

export default nextConfig;