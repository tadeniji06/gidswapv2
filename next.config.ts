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
	typescript: {
		ignoreBuildErrors: true,
	},
	experimental: {
		allowedDevOrigins: ["http://192.168.0.103:3000", "http://localhost:3000"],
	},
};

export default nextConfig;
