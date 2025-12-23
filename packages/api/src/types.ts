import type { Logger } from "./logger";

declare module "hono" {
	interface ContextVariableMap {
		requestId: string;
		logger: Logger;
		session?: {
			user?: {
				id?: string;
				email?: string;
				name?: string;
			};
		};
	}
}
