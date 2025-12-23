import { config } from "dotenv";
import { defineConfig } from "vitest/config";

config({ path: "./apps/server/.env" });

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}"],
		exclude: ["**/node_modules/**", "**/dist/**", "**/apps/docs/**"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/**",
				"dist/**",
				"**/*.d.ts",
				"**/*.config.*",
				"apps/docs/**",
			],
		},
		testTimeout: 10000,
		hookTimeout: 10000,
	},
});
