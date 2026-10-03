import { describe, expect, test } from "bun:test";
import { MCPTransportError } from "@oh-my-pi/pi-coding-agent/mcp/errors";

describe("MCPTransportError diagnostics", () => {
	test("bounds remote error scanning before redaction work", () => {
		const error = new MCPTransportError({
			transport: "http",
			stage: "receive",
			failure: "unknown",
			message: `Authorization: Bearer supersecret${"\t".repeat(100_000)}`,
			retryable: false,
		});
		expect(error.message).not.toContain("supersecret");
		expect(error.message.length).toBeLessThanOrEqual(1_000);
	});
});
