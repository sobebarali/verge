import { router } from "../../index";
import { extractDataHandler } from "./extract-data";

export const scrapeRouter = router({
	extractData: extractDataHandler,
});

export * from "./extract-data/extract-data.schema";
