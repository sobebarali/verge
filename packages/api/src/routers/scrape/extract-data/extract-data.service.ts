import type { Logger } from "pino";
import { getFirecrawlClient } from "../../../services/firecrawl";
import type { ExtractDataInput, ExtractDataOutput } from "./extract-data.schema";

export async function extractData(
	input: ExtractDataInput,
	logger: Logger,
): Promise<ExtractDataOutput> {
	const { url, prompt, outputSchema } = input;
	const firecrawl = getFirecrawlClient();

	const formats: Array<
		"markdown" | { type: "json"; schema?: Record<string, unknown>; prompt?: string }
	> = ["markdown"];

	if (outputSchema) {
		formats.push({ type: "json", schema: outputSchema, prompt });
	} else if (prompt) {
		formats.push({ type: "json", prompt });
	}

	logger.debug({ url, formats }, "Calling Firecrawl API");

	const result = await firecrawl.scrape(url, { formats });

	return {
		success: true,
		data: result.json ?? result.markdown ?? null,
		metadata: {
			title: result.metadata?.title,
			sourceURL: result.metadata?.sourceURL ?? url,
		},
	};
}
