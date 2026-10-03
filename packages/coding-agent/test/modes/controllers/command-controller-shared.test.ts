import { describe, expect, it } from "bun:test";
import { commandTail } from "@oh-my-pi/pi-coding-agent/modes/controllers/command-controller-shared";

describe("commandTail", () => {
	it("extracts case-insensitive command tails across whitespace variants", () => {
		expect(commandTail("/MCP\tadd   server --scope user", "/mcp", ["add"])).toBe("server --scope user");
		expect(commandTail("/ssh remove host", "/ssh", ["remove", "rm"])).toBe("host");
		expect(commandTail("/ssh rm\thost", "/ssh", ["remove", "rm"])).toBe("host");
	});

	it("rejects a missing separator and a word-character suffix", () => {
		expect(commandTail("/mcpadd server", "/mcp", ["add"])).toBe("");
		expect(commandTail("/mcp additional server", "/mcp", ["add"])).toBe("");
	});

	it("handles adversarial whitespace runs without regex backtracking", () => {
		expect(commandTail(`/mcp${" ".repeat(100_000)}add${"\t".repeat(100_000)}server`, "/mcp", ["add"])).toBe("server");
	});
});
