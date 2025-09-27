import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.coingecko.com", 
      },
      {
        protocol: "https",
        hostname: "wise.com",
      },
    ],
  },
};

export default nextConfig;
