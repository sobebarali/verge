import Firecrawl from "@mendable/firecrawl-js";

let firecrawlClient: Firecrawl | null = null;

export function getFirecrawlClient(): Firecrawl {
	if (!firecrawlClient) {
		const apiKey = process.env.FIRECRAWL_API_KEY;
		if (!apiKey) {
			throw new Error("FIRECRAWL_API_KEY is not set");
		}
		firecrawlClient = new Firecrawl({ apiKey });
	}
	return firecrawlClient;
}
