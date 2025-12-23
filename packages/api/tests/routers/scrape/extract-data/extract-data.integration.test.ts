import { beforeAll, describe, expect, it } from "vitest";
import { extractData } from "../../../../src/routers/scrape/extract-data/extract-data.service";

const hasApiKey = !!process.env.FIRECRAWL_API_KEY;

const mockLogger = {
	debug: () => {},
	info: () => {},
	warn: () => {},
	error: () => {},
} as unknown as Parameters<typeof extractData>[1];

describe.skipIf(!hasApiKey)("extractData integration", () => {
	beforeAll(() => {
		if (!hasApiKey) {
			console.log("Skipping integration tests: FIRECRAWL_API_KEY not set");
		}
	});

	it("extracts markdown content from a real webpage", { timeout: 30000 }, async () => {
		const result = await extractData(
			{
				url: "https://example.com",
				prompt: "Extract the main heading and paragraph text",
			},
			mockLogger,
		);

		expect(result.success).toBe(true);
		expect(result.data).toBeDefined();
		expect(result.metadata?.sourceURL).toContain("example.com");
	});

	it("extracts structured data with outputSchema", { timeout: 30000 }, async () => {
		const result = await extractData(
			{
				url: "https://example.com",
				outputSchema: {
					type: "object",
					properties: {
						title: { type: "string" },
						hasLinks: { type: "boolean" },
					},
				},
			},
			mockLogger,
		);

		expect(result.success).toBe(true);
		expect(result.data).toBeDefined();
	});

	it("extracts data with both prompt and schema", { timeout: 30000 }, async () => {
		const result = await extractData(
			{
				url: "https://example.com",
				prompt: "Focus on the main content area",
				outputSchema: {
					type: "object",
					properties: {
						mainText: { type: "string" },
					},
				},
			},
			mockLogger,
		);

		expect(result.success).toBe(true);
		expect(result.data).toBeDefined();
	});

	it("returns metadata with title and sourceURL", { timeout: 30000 }, async () => {
		const result = await extractData(
			{
				url: "https://example.com",
				prompt: "Get the page title",
			},
			mockLogger,
		);

		expect(result.metadata).toBeDefined();
		expect(result.metadata?.sourceURL).toContain("example.com");
		expect(typeof result.metadata?.title).toBe("string");
	});
});

describe.skipIf(!hasApiKey)("extractData error handling", () => {
	it("throws error for non-existent domain", { timeout: 30000 }, async () => {
		await expect(
			extractData(
				{
					url: "https://this-domain-definitely-does-not-exist-12345.com",
					prompt: "test",
				},
				mockLogger,
			),
		).rejects.toThrow();
	});
});
