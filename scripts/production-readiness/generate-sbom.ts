#!/usr/bin/env bun

import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

interface SbomProperty {
	name: string;
	value: string;
}

export interface SbomComponent extends Record<string, unknown> {
	"bom-ref": string;
	type: string;
	name: string;
	version?: string;
	purl?: string;
	properties?: SbomProperty[];
}

interface CycloneDxSbom extends Record<string, unknown> {
	bomFormat: string;
	specVersion: string;
	version: number;
	metadata: Record<string, unknown>;
	components: SbomComponent[];
}

export interface AugmentedSbom extends CycloneDxSbom {
	lockPackageCount: number;
	addedPackageCount: number;
}

export interface ValidatedSbomPaths {
	source: string;
	output: string;
}

interface PackageIdentity {
	name: string;
	version: string;
	purl: string;
}

const INVENTORY_COUNT_PROPERTY = "omp:inventory:bun-lock-package-count";
const INVENTORY_SCOPE_PROPERTY = "omp:inventory:bun-lock-scope";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSbom(value: unknown): CycloneDxSbom {
	if (!isRecord(value) || value.bomFormat !== "CycloneDX" || !isRecord(value.metadata)) {
		throw new Error("Input SBOM must be a CycloneDX JSON document");
	}
	if (typeof value.specVersion !== "string" || typeof value.version !== "number" || !Array.isArray(value.components)) {
		throw new Error("Input SBOM is missing required CycloneDX fields");
	}
	for (const component of value.components) {
		if (
			!isRecord(component) ||
			typeof component["bom-ref"] !== "string" ||
			typeof component.type !== "string" ||
			typeof component.name !== "string" ||
			(component.version !== undefined && typeof component.version !== "string")
		) {
			throw new Error("Input SBOM contains an invalid component");
		}
	}
	return structuredClone(value) as CycloneDxSbom;
}

function parsePackageIdentity(raw: string): PackageIdentity | undefined {
	const separator = raw.lastIndexOf("@");
	if (separator <= 0 || separator === raw.length - 1) {
		throw new Error(`Unsupported bun.lock package identity: ${raw}`);
	}
	const name = raw.slice(0, separator);
	const version = raw.slice(separator + 1);
	if (version.startsWith("workspace:")) return undefined;
	if (!/^\d/.test(version)) {
		throw new Error(`Unsupported bun.lock package identity: ${raw}`);
	}
	const purlName = name.startsWith("@")
		? `${encodeURIComponent(name.slice(0, name.indexOf("/")))}/${encodeURIComponent(name.slice(name.indexOf("/") + 1))}`
		: encodeURIComponent(name);
	return { name, version, purl: `pkg:npm/${purlName}@${encodeURIComponent(version)}` };
}

function packageIdentities(lock: unknown): PackageIdentity[] {
	if (!isRecord(lock) || lock.lockfileVersion !== 1 || !isRecord(lock.packages)) {
		throw new Error("Input lockfile must be a Bun v1 text lockfile");
	}
	const packages = new Map<string, PackageIdentity>();
	for (const record of Object.values(lock.packages)) {
		if (!Array.isArray(record) || typeof record[0] !== "string") {
			throw new Error("Input bun.lock contains an invalid package record");
		}
		const identity = parsePackageIdentity(record[0]);
		if (identity) packages.set(`${identity.name}\0${identity.version}`, identity);
	}
	return [...packages.values()].sort(
		(left, right) => left.name.localeCompare(right.name) || left.version.localeCompare(right.version),
	);
}

export function augmentSbomWithBunLock(sbomInput: unknown, lockInput: unknown): AugmentedSbom {
	const sbom = parseSbom(sbomInput);
	const identities = packageIdentities(lockInput);
	const represented = new Set(
		sbom.components
			.filter(component => component.purl?.startsWith("pkg:npm/") && component.version !== undefined)
			.map(component => `${component.name}\0${component.version}`),
	);
	let addedPackageCount = 0;
	for (const identity of identities) {
		const key = `${identity.name}\0${identity.version}`;
		if (represented.has(key)) continue;
		sbom.components.push({
			"bom-ref": identity.purl,
			type: "library",
			name: identity.name,
			version: identity.version,
			purl: identity.purl,
			properties: [
				{ name: "omp:inventory:source", value: "bun.lock" },
				{ name: "omp:inventory:scope", value: "locked dependency superset" },
			],
		});
		represented.add(key);
		addedPackageCount += 1;
	}

	sbom.components.sort(
		(left, right) =>
			left.name.localeCompare(right.name) ||
			(left.version ?? "").localeCompare(right.version ?? "") ||
			left["bom-ref"].localeCompare(right["bom-ref"]),
	);
	const metadataProperties = Array.isArray(sbom.metadata.properties)
		? sbom.metadata.properties.filter(
				property =>
					!isRecord(property) ||
					(property.name !== INVENTORY_COUNT_PROPERTY && property.name !== INVENTORY_SCOPE_PROPERTY),
			)
		: [];
	metadataProperties.push(
		{ name: INVENTORY_COUNT_PROPERTY, value: String(identities.length) },
		{
			name: INVENTORY_SCOPE_PROPERTY,
			value: "all external bun.lock records, including optional and development dependencies",
		},
	);
	sbom.metadata.properties = metadataProperties;

	return { ...sbom, lockPackageCount: identities.length, addedPackageCount };
}

export function validateSbomPaths(sourceInput: string, outputInput: string): ValidatedSbomPaths {
	const source = path.resolve(sourceInput);
	const output = path.resolve(outputInput);
	if (output === source || output.startsWith(`${source}${path.sep}`)) {
		throw new Error("SBOM output must be outside the scanned source directory");
	}
	return { source, output };
}

function argument(name: string): string | undefined {
	const index = process.argv.indexOf(name);
	return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
	const source = argument("--source");
	const output = argument("--output");
	const sourceVersion = argument("--source-version");
	const sourceName = argument("--source-name") ?? "Frictionless-Labs/oh-my-pi";
	const syft = argument("--syft") ?? "syft";
	if (!source || !output || !sourceVersion) {
		throw new Error(
			"Usage: generate-sbom.ts --source <directory> --source-version <git-sha> --output <SBOM.json> [--source-name <name>] [--syft <path>]",
		);
	}

	const paths = validateSbomPaths(source, output);
	const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "omp-sbom-"));
	const baseSbom = path.join(tempDir, "syft.cdx.json");
	try {
		const child = Bun.spawn(
			[
				syft,
				"scan",
				`dir:${paths.source}`,
				"--source-name",
				sourceName,
				"--source-version",
				sourceVersion,
				"--output",
				`cyclonedx-json=${baseSbom}`,
			],
			{ stdout: "ignore", stderr: "pipe" },
		);
		const stderr = await new Response(child.stderr).text();
		const exitCode = await child.exited;
		if (exitCode !== 0) {
			throw new Error(`Syft failed with exit ${exitCode}: ${stderr.trim()}`);
		}

		const sbom = (await Bun.file(baseSbom).json()) as unknown;
		const lock = Bun.JSON5.parse(await Bun.file(path.join(paths.source, "bun.lock")).text()) as unknown;
		const augmented = augmentSbomWithBunLock(sbom, lock);
		const { lockPackageCount, addedPackageCount, ...document } = augmented;
		await Bun.write(paths.output, `${JSON.stringify(document, null, 2)}\n`);
		console.log(
			`Generated ${document.components.length} components with ${lockPackageCount} Bun lock records (${addedPackageCount} added).`,
		);
	} finally {
		await fs.rm(tempDir, { recursive: true, force: true });
	}
}

if (import.meta.main) {
	await main();
}
