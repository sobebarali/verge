import { Polar } from "@polar-sh/sdk";

const isProd = process.env.NODE_ENV === "production";

export const polarClient = new Polar({
	accessToken: process.env.POLAR_ACCESS_TOKEN,
	server: isProd ? "production" : "sandbox",
});
