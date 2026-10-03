import { describe, expect, it } from "bun:test";
import { isDashScopeTokenLimitText, isOAuthExpiry, status } from "@oh-my-pi/pi-ai/error";

describe("bounded error-text classification", () => {
	it("keeps authentication and status evidence from the diagnostic tail", () => {
		const filler = "x".repeat(100_000);
		expect(isOAuthExpiry(`${filler} invalid_grant`)).toBe(true);
		expect(status(new Error(`${filler} HTTP 429`))).toBe(429);
	});

	it("keeps DashScope throttle evidence across the retained head and tail", () => {
		const message =
			`https://help.aliyun.com/error-code#token-limit ${"x".repeat(100_000)}` +
			" You exceeded your current quota, please check your plan and billing details";
		expect(isDashScopeTokenLimitText(message)).toBe(true);
	});
});
