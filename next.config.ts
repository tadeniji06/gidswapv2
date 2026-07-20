import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

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
	// Strip all console.log (but keep console.warn and console.error) in production builds
	compiler: {
		removeConsole: process.env.NODE_ENV === "production"
			? { exclude: ["warn", "error"] }
			: false,
	},
};

export default withPWA(nextConfig);
