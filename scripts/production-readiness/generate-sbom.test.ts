import { describe, expect, test } from "bun:test";

import { augmentSbomWithBunLock } from "./generate-sbom";

describe("release SBOM Bun lock reconciliation", () => {
	test("adds nested and aliased lock records missing from the scanner inventory", () => {
		const sbom = {
			bomFormat: "CycloneDX",
			specVersion: "1.7",
			version: 1,
			metadata: {},
			components: [
				{
					"bom-ref": "existing",
					type: "library",
					name: "@huggingface/transformers",
					version: "4.3.0",
					purl: "pkg:npm/%40huggingface/transformers@4.3.0",
				},
			],
		};
		const lock = {
			lockfileVersion: 1,
			packages: {
				"@huggingface/transformers": ["@huggingface/transformers@4.3.0", "", {}],
				"@huggingface/transformers/onnxruntime-node": ["onnxruntime-node@1.30.0", "", {}],
				"onnxruntime-common": ["onnxruntime-common@1.30.0", "", {}],
				tar: ["tar@7.5.22", "", {}],
				"@oh-my-pi/pi-ai": ["@oh-my-pi/pi-ai@workspace:packages/ai"],
			},
		};

		const result = augmentSbomWithBunLock(sbom, lock);
		const npmComponents = result.components.filter(component => component.purl?.startsWith("pkg:npm/"));
		expect(npmComponents.map(component => `${component.name}@${component.version}`)).toEqual([
			"@huggingface/transformers@4.3.0",
			"onnxruntime-common@1.30.0",
			"onnxruntime-node@1.30.0",
			"tar@7.5.22",
		]);
		expect(result.lockPackageCount).toBe(4);
		expect(result.addedPackageCount).toBe(3);
	});

	test("rejects a malformed external package record instead of silently omitting it", () => {
		expect(() =>
			augmentSbomWithBunLock(
				{ bomFormat: "CycloneDX", specVersion: "1.7", version: 1, metadata: {}, components: [] },
				{ lockfileVersion: 1, packages: { broken: ["missing-version-delimiter"] } },
			),
		).toThrow("Unsupported bun.lock package identity");
	});
});
