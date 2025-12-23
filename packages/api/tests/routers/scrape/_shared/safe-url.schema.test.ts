import { describe, expect, it } from "vitest";
import { safeUrl } from "../../../../src/routers/scrape/_shared/safe-url.schema";

describe("safeUrl schema", () => {
	describe("valid URLs", () => {
		it("accepts valid HTTP URLs", () => {
			const result = safeUrl.safeParse("http://example.com");
			expect(result.success).toBe(true);
		});

		it("accepts valid HTTPS URLs", () => {
			const result = safeUrl.safeParse("https://example.com");
			expect(result.success).toBe(true);
		});

		it("accepts URLs with paths", () => {
			const result = safeUrl.safeParse("https://example.com/path/to/page");
			expect(result.success).toBe(true);
		});

		it("accepts URLs with query parameters", () => {
			const result = safeUrl.safeParse("https://example.com?foo=bar&baz=qux");
			expect(result.success).toBe(true);
		});

		it("accepts URLs with ports", () => {
			const result = safeUrl.safeParse("https://example.com:8080/api");
			expect(result.success).toBe(true);
		});
	});

	describe("invalid URLs", () => {
		it("rejects non-URL strings", () => {
			const result = safeUrl.safeParse("not-a-url");
			expect(result.success).toBe(false);
		});

		it("rejects empty strings", () => {
			const result = safeUrl.safeParse("");
			expect(result.success).toBe(false);
		});
	});

	describe("protocol restrictions", () => {
		it("rejects FTP protocol", () => {
			const result = safeUrl.safeParse("ftp://example.com");
			expect(result.success).toBe(false);
		});

		it("rejects file protocol", () => {
			const result = safeUrl.safeParse("file:///etc/passwd");
			expect(result.success).toBe(false);
		});
	});

	describe("SSRF protection - localhost", () => {
		it("rejects localhost", () => {
			const result = safeUrl.safeParse("http://localhost/api");
			expect(result.success).toBe(false);
		});

		it("rejects 127.0.0.1", () => {
			const result = safeUrl.safeParse("http://127.0.0.1/api");
			expect(result.success).toBe(false);
		});

		it("rejects 0.0.0.0", () => {
			const result = safeUrl.safeParse("http://0.0.0.0/api");
			expect(result.success).toBe(false);
		});

		it("rejects [::1]", () => {
			const result = safeUrl.safeParse("http://[::1]/api");
			expect(result.success).toBe(false);
		});
	});

	describe("SSRF protection - private IP ranges", () => {
		it("rejects 10.x.x.x addresses", () => {
			const result = safeUrl.safeParse("http://10.0.0.1/api");
			expect(result.success).toBe(false);
		});

		it("rejects 172.16.x.x addresses", () => {
			const result = safeUrl.safeParse("http://172.16.0.1/api");
			expect(result.success).toBe(false);
		});

		it("allows 172.15.x.x (not in private range)", () => {
			const result = safeUrl.safeParse("http://172.15.0.1/api");
			expect(result.success).toBe(true);
		});

		it("rejects 192.168.x.x addresses", () => {
			const result = safeUrl.safeParse("http://192.168.1.1/api");
			expect(result.success).toBe(false);
		});

		it("rejects 169.254.x.x link-local (AWS metadata)", () => {
			const result = safeUrl.safeParse(
				"http://169.254.169.254/latest/meta-data",
			);
			expect(result.success).toBe(false);
		});
	});

	describe("case insensitivity", () => {
		it("rejects LOCALHOST (uppercase)", () => {
			const result = safeUrl.safeParse("http://LOCALHOST/api");
			expect(result.success).toBe(false);
		});
	});
});
