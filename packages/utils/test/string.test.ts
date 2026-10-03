import { describe, expect, test } from "bun:test";
import { stripTrailingCharacter, trimTrailingHorizontalWhitespace } from "../src/string";

describe("linear string helpers", () => {
	test("strips only the requested trailing character from adversarial-length input", () => {
		const prefix = "https://example.test/path";
		expect(stripTrailingCharacter(`${prefix}${"/".repeat(100_000)}`, "/")).toBe(prefix);
		expect(stripTrailingCharacter(`${"/".repeat(100_000)}x`, "/")).toBe(`${"/".repeat(100_000)}x`);
	});

	test("rejects a multi-character delimiter", () => {
		expect(() => stripTrailingCharacter("value--", "--")).toThrow("single UTF-16 code unit");
	});

	test("trims trailing spaces and tabs without consuming line endings", () => {
		expect(trimTrailingHorizontalWhitespace(`value${" \t".repeat(50_000)}`)).toBe("value");
		expect(trimTrailingHorizontalWhitespace("value \t\n\t")).toBe("value \t\n");
	});
});
