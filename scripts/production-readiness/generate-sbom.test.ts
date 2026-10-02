import { describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import { augmentSbomWithBunLock, validateSbomPaths } from "./generate-sbom";

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

	test("rejects lexical and symlink-aliased output inside the scanned source", async () => {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), "sbom-path-test-"));
		try {
			const source = path.join(root, "source");
			const sourceAlias = path.join(root, "source-alias");
			const outside = path.join(root, "release", "SBOM.json");
			await fs.mkdir(source);
			await fs.symlink(source, sourceAlias, "dir");

			await expect(validateSbomPaths(source, path.join(source, "release", "SBOM.json"))).rejects.toThrow(
				"outside the scanned source directory",
			);
			await expect(validateSbomPaths(source, path.join(sourceAlias, "release", "SBOM.json"))).rejects.toThrow(
				"outside the scanned source directory",
			);
			const canonicalRoot = await fs.realpath(root);
			expect(await validateSbomPaths(source, outside)).toEqual({
				source: path.join(canonicalRoot, "source"),
				output: path.join(canonicalRoot, "release", "SBOM.json"),
			});
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});

	test("rejects an unresolved output-directory symlink", async () => {
		const root = await fs.mkdtemp(path.join(os.tmpdir(), "sbom-dangling-path-test-"));
		try {
			const source = path.join(root, "source");
			const danglingOutputDir = path.join(root, "release-alias");
			await fs.mkdir(source);
			await fs.symlink(path.join(root, "missing-release"), danglingOutputDir, "dir");

			await expect(validateSbomPaths(source, path.join(danglingOutputDir, "SBOM.json"))).rejects.toThrow(
				"unresolved symbolic link",
			);
		} finally {
			await fs.rm(root, { recursive: true, force: true });
		}
	});
});
