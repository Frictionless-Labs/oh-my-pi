import { describe, expect, test } from "bun:test";
import * as path from "node:path";

interface WorkflowTrigger {
	pull_request?: unknown;
}

interface Workflow {
	env?: Record<string, string>;
	on?: WorkflowTrigger;
}

const WORKFLOWS = ["ci.yml", "nix.yml", "security.yml"] as const;

describe("stacked pull-request validation", () => {
	for (const filename of WORKFLOWS) {
		test(`${filename} validates pull requests targeting any stack branch`, async () => {
			const source = await Bun.file(path.join(import.meta.dir, "..", "..", ".github", "workflows", filename)).text();
			const workflow = Bun.YAML.parse(source) as Workflow;
			expect(Object.hasOwn(workflow.on ?? {}, "pull_request")).toBe(true);
			expect(workflow.on?.pull_request).toBeNull();
		});
	}

	test("upstream monitor tracks the frozen stack baseline", async () => {
		const source = await Bun.file(
			path.join(import.meta.dir, "..", "..", ".github", "workflows", "upstream-monitor.yml"),
		).text();
		const workflow = Bun.YAML.parse(source) as Workflow;
		expect(workflow.env?.BASELINE_TAG).toBe("v18.5.0");
		expect(workflow.env?.BASELINE_SHA).toBe("9348320cc4a30a7195d36a1f05a6c11bcb701a17");
	});
});
