import { z } from "zod";
import { safeUrl } from "../_shared/safe-url.schema";

export const extractDataInput = z
	.object({
		url: safeUrl,
		prompt: z.string().min(1).max(2000).optional(),
		outputSchema: z.record(z.string(), z.unknown()).optional(),
	})
	.refine((data) => data.prompt || data.outputSchema, {
		message: "Either prompt or outputSchema must be provided",
	});

export const extractDataOutput = z.object({
	success: z.boolean(),
	data: z.unknown(),
	metadata: z
		.object({
			title: z.string().optional(),
			sourceURL: z.string(),
		})
		.optional(),
});

export type ExtractDataInput = z.infer<typeof extractDataInput>;
export type ExtractDataOutput = z.infer<typeof extractDataOutput>;
