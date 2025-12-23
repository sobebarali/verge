// @ts-check

import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: "Verge Docs",
			description:
				"Internal API documentation for Verge - AI-powered web scraping for Google Sheets",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/your-org/verge",
				},
			],
			sidebar: [
				{
					label: "Getting Started",
					items: [
						{ label: "Introduction", slug: "getting-started" },
						{ label: "Installation", slug: "getting-started/installation" },
						{
							label: "Project Structure",
							slug: "getting-started/project-structure",
						},
						{
							label: "Environment Variables",
							slug: "getting-started/environment-variables",
						},
					],
				},
				{
					label: "Architecture",
					items: [
						{ label: "Overview", slug: "architecture" },
						{
							label: "Monorepo Structure",
							slug: "architecture/monorepo-structure",
						},
						{ label: "Data Flow", slug: "architecture/data-flow" },
						{
							label: "Technology Decisions",
							slug: "architecture/technology-decisions",
						},
					],
				},
				{
					label: "API Reference",
					items: [
						{ label: "Overview", slug: "api" },
						{
							label: "tRPC",
							collapsed: false,
							items: [
								{ label: "Setup & Conventions", slug: "api/trpc" },
								{ label: "Context", slug: "api/trpc/context" },
								{ label: "Procedures", slug: "api/trpc/procedures" },
								{
									label: "Routers",
									collapsed: true,
									items: [
										{ label: "Overview", slug: "api/trpc/routers" },
										{
											label: "healthCheck",
											slug: "api/trpc/routers/health-check",
										},
										{
											label: "privateData",
											slug: "api/trpc/routers/private-data",
										},
									],
								},
							],
						},
						{
							label: "Authentication",
							collapsed: false,
							items: [
								{ label: "Overview", slug: "api/authentication" },
								{ label: "Endpoints", slug: "api/authentication/endpoints" },
								{
									label: "Email & Password",
									slug: "api/authentication/email-password",
								},
								{
									label: "Session Management",
									slug: "api/authentication/session-management",
								},
								{
									label: "Client Integration",
									slug: "api/authentication/client-integration",
								},
							],
						},
						{
							label: "Payments",
							collapsed: true,
							items: [
								{ label: "Overview", slug: "api/payments" },
								{ label: "Checkout", slug: "api/payments/checkout" },
								{
									label: "Customer Portal",
									slug: "api/payments/customer-portal",
								},
							],
						},
						{
							label: "Error Handling",
							collapsed: true,
							items: [
								{ label: "Overview", slug: "api/errors" },
								{ label: "Error Codes", slug: "api/errors/error-codes" },
							],
						},
					],
				},
				{
					label: "Database",
					items: [
						{ label: "Overview", slug: "database" },
						{ label: "Connection", slug: "database/connection" },
						{
							label: "Models",
							collapsed: true,
							items: [
								{ label: "Overview", slug: "database/models" },
								{ label: "User", slug: "database/models/user" },
								{ label: "Session", slug: "database/models/session" },
								{ label: "Account", slug: "database/models/account" },
								{ label: "Verification", slug: "database/models/verification" },
							],
						},
					],
				},
				{
					label: "Packages",
					items: [
						{ label: "Overview", slug: "packages" },
						{ label: "@verge/api", slug: "packages/api" },
						{ label: "@verge/auth", slug: "packages/auth" },
						{ label: "@verge/db", slug: "packages/db" },
					],
				},
				{
					label: "Developer Guides",
					items: [
						{ label: "Overview", slug: "guides" },
						{
							label: "Adding a tRPC Endpoint",
							slug: "guides/adding-a-trpc-endpoint",
						},
						{
							label: "Adding a Database Model",
							slug: "guides/adding-a-database-model",
						},
						{
							label: "Adding Authentication",
							slug: "guides/adding-authentication",
						},
						{ label: "Testing Locally", slug: "guides/testing-locally" },
					],
				},
				{
					label: "Roadmap",
					badge: { text: "Planned", variant: "caution" },
					items: [
						{ label: "Overview", slug: "roadmap" },
						{ label: "Web Scraping API", slug: "roadmap/web-scraping-api" },
						{ label: "AI Extraction", slug: "roadmap/ai-extraction" },
						{
							label: "Google Sheets Integration",
							slug: "roadmap/google-sheets-integration",
						},
						{ label: "Prompt Queries", slug: "roadmap/prompt-queries" },
					],
				},
			],
		}),
	],
});
