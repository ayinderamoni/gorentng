import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "120mb",
    },
    // proxy.ts buffers the request body; default is 10mb and truncates video uploads.
    proxyClientMaxBodySize: "120mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
