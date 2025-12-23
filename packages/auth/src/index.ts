import { checkout, polar, portal } from "@polar-sh/better-auth";
import { client } from "@verge/db";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

import { polarClient } from "./lib/payments";

// Validate required environment variables
const CORS_ORIGIN = process.env.CORS_ORIGIN;
if (!CORS_ORIGIN) {
	throw new Error("CORS_ORIGIN environment variable is required for auth");
}

// Polar configuration from environment
const POLAR_PRODUCT_ID = process.env.POLAR_PRODUCT_ID;
const POLAR_SUCCESS_URL = process.env.POLAR_SUCCESS_URL;
const isPolarConfigured = POLAR_PRODUCT_ID && POLAR_SUCCESS_URL;

// Build plugins array conditionally
// Note: Type assertion needed due to version mismatch between @polar-sh/sdk and @polar-sh/better-auth
const plugins = isPolarConfigured
	? [
			polar({
				client: polarClient as unknown as Parameters<typeof polar>[0]["client"],
				createCustomerOnSignUp: true,
				enableCustomerPortal: true,
				use: [
					checkout({
						products: [
							{
								productId: POLAR_PRODUCT_ID,
								slug: "pro",
							},
						],
						successUrl: POLAR_SUCCESS_URL,
						authenticatedUsersOnly: true,
					}),
					portal(),
				],
			}),
		]
	: [];

export const auth = betterAuth({
	database: mongodbAdapter(client),
	trustedOrigins: [CORS_ORIGIN],
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
			secure: process.env.NODE_ENV === "production",
			httpOnly: true,
		},
	},
	plugins,
});
