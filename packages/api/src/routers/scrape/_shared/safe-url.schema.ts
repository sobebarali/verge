import { z } from "zod";

const BLOCKED_HOSTNAMES = ["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"];
const BLOCKED_IP_PATTERNS = [
	/^10\./,
	/^172\.(1[6-9]|2[0-9]|3[01])\./,
	/^192\.168\./,
	/^169\.254\./,
	/^fc00:/i,
	/^fe80:/i,
];

export const safeUrl = z
	.string()
	.url()
	.refine(
		(urlString) => {
			try {
				const url = new URL(urlString);
				return ["http:", "https:"].includes(url.protocol);
			} catch {
				return false;
			}
		},
		{ message: "Only HTTP and HTTPS protocols are allowed" },
	)
	.refine(
		(urlString) => {
			try {
				const url = new URL(urlString);
				return !BLOCKED_HOSTNAMES.includes(url.hostname.toLowerCase());
			} catch {
				return false;
			}
		},
		{ message: "Local and loopback addresses are not allowed" },
	)
	.refine(
		(urlString) => {
			try {
				const url = new URL(urlString);
				return !BLOCKED_IP_PATTERNS.some((p) => p.test(url.hostname));
			} catch {
				return false;
			}
		},
		{ message: "Private and internal IP addresses are not allowed" },
	);
