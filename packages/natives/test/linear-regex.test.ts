import { describe, expect, test } from "bun:test";
import { linearRegexFind } from "../native";

describe("linearRegexFind", () => {
	test("preserves useful regex matching and the exact first match", () => {
		expect(linearRegexFind("ready|listening", "service is listening on 8080")).toBe("listening");
		expect(linearRegexFind("^", "ready")).toBe("");
	});

	test("handles a backtracking-shaped pattern over adversarial input in bounded time", () => {
		const input = `${"a".repeat(100_000)}!`;
		expect(linearRegexFind("(a+)+$", input)).toBeNull();
	});

	test("rejects engine features that cannot retain a linear-time guarantee", () => {
		expect(() => linearRegexFind("(ready)\\1", "readyready")).toThrow("backreferences are not supported");
		expect(() => linearRegexFind("ready(?=!)", "ready!")).toThrow("look-around");
	});

	test("rejects patterns above the fixed compilation budget", () => {
		expect(() => linearRegexFind("a".repeat(4097), "a")).toThrow("4096-byte safety limit");
	});
});
