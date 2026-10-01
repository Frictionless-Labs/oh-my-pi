import { afterEach, describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

const LAUNCHER = path.join(import.meta.dir, "Open-Pi.command");
const SHA = "a".repeat(40);
const DIGEST = "b".repeat(64);
const tempRoots: string[] = [];
const describeMac = process.platform === "darwin" ? describe : describe.skip;

interface Fixture {
	root: string;
	repo: string;
	profileModels: string;
	env: Record<string, string>;
}

async function executable(file: string, content: string): Promise<void> {
	await Bun.write(file, `#!/bin/zsh\nset -euo pipefail\n${content}\n`);
	await fs.chmod(file, 0o700);
}

async function fixture(): Promise<Fixture> {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "open-pi-test-"));
	tempRoots.push(root);
	const repo = path.join(root, "repo");
	const bin = path.join(root, "bin");
	const profileDir = path.join(root, "profile");
	const profileConfig = path.join(profileDir, "config.yml");
	const profileModels = path.join(profileDir, "models.yml");
	const serverConfig = path.join(root, "server.json");
	const approvedFile = path.join(root, "approved-sha");
	const bun = path.join(bin, "bun");
	const ollama = path.join(bin, "ollama");

	await fs.mkdir(path.join(repo, ".git"), { recursive: true });
	await fs.mkdir(path.join(repo, "node_modules"), { recursive: true });
	await fs.mkdir(path.join(repo, "packages/natives/native"), { recursive: true });
	await fs.mkdir(path.join(repo, "packages/coding-agent/src/export/html"), { recursive: true });
	await fs.mkdir(bin, { recursive: true });
	await fs.mkdir(profileDir, { recursive: true });
	await Bun.write(path.join(repo, "packages/natives/native/pi_natives.darwin-arm64.node"), "native");
	await Bun.write(path.join(repo, "packages/coding-agent/src/export/html/tool-views.generated.js"), "generated");
	await Bun.write(path.join(repo, "packages/coding-agent/package.json"), '{"version":"18.4.8"}\n');
	await Bun.write(profileConfig, "enabledModels:\n  - ollama/qwen3-coder:30b\n");
	await Bun.write(serverConfig, '{"disable_ollama_cloud":true}\n');
	await Bun.write(approvedFile, `${SHA}\n`);
	await fs.chmod(approvedFile, 0o600);

	await executable(
		path.join(bin, "git"),
		`case "$*" in
  *"rev-parse --show-toplevel"*) print -r -- "$OPEN_PI_TEST_REPO" ;;
  *"branch --show-current"*) print -r -- "main" ;;
  *"status --porcelain"*) ;;
  *"remote get-url origin"*) print -r -- "\${OPEN_PI_TEST_ORIGIN:-https://github.com/Frictionless-Labs/oh-my-pi.git}" ;;
  *"rev-parse HEAD"*) print -r -- "${SHA}" ;;
  *) print -u2 -r -- "unexpected git invocation: $*"; exit 90 ;;
esac`,
	);
	await executable(
		path.join(bin, "curl"),
		`url="\${@[-1]}"
case "$url" in
  */api/version) print -r -- "{\\"version\\":\\"\${OPEN_PI_TEST_OLLAMA_VERSION:-0.35.0}\\"}" ;;
  */api/status) print -r -- "{\\"cloud\\":{\\"disabled\\":\${OPEN_PI_TEST_CLOUD_DISABLED:-true},\\"source\\":\\"test\\"}}" ;;
  */api/tags) print -r -- "{\\"models\\":[{\\"name\\":\\"qwen3-coder:30b\\",\\"digest\\":\\"${DIGEST}\\"}]}" ;;
  *) print -u2 -r -- "unexpected curl URL: $url"; exit 91 ;;
esac`,
	);
	await executable(
		path.join(bin, "lsof"),
		`print -r -- "COMMAND PID USER FD TYPE DEVICE SIZE/OFF NODE NAME"
if [[ "\${OPEN_PI_TEST_NO_LISTENER:-0}" != "1" ]]; then
  print -r -- "ollama 1 test 3u IPv4 0t0 TCP 127.0.0.1:11434 (LISTEN)"
fi
if [[ -n "\${OPEN_PI_TEST_EXTRA_LISTENER:-}" ]]; then
  print -r -- "ollama 1 test 4u IPv4 0t0 TCP \${OPEN_PI_TEST_EXTRA_LISTENER} (LISTEN)"
fi`,
	);
	await executable(
		bun,
		`if [[ "$1" == "--version" ]]; then
  print -r -- "1.4.2"
  exit 0
fi
[[ "\${OLLAMA_BASE_URL:-}" == "http://127.0.0.1:11434" ]] || exit 92
[[ "\${OLLAMA_HOST:-}" == "127.0.0.1:11434" ]] || exit 93
print -r -- '{"models":[{"provider":"ollama","id":"qwen3-coder:30b"}]}'`,
	);
	await executable(ollama, "exit 0");

	return {
		root,
		repo,
		profileModels,
		env: {
			OPEN_PI_TEST_MODE: "1",
			OPEN_PI_TEST_REPO: repo,
			OPEN_PI_TEST_BUN_BIN: bun,
			OPEN_PI_TEST_OLLAMA_BIN: ollama,
			OPEN_PI_TEST_APPROVED_FILE: approvedFile,
			OPEN_PI_TEST_DIGEST: DIGEST,
			OPEN_PI_TEST_AUTOSTART: "0",
			OPEN_PI_TEST_PROFILE_CONFIG: profileConfig,
			OPEN_PI_TEST_PROFILE_MODELS: profileModels,
			OPEN_PI_TEST_SERVER_CONFIG: serverConfig,
			OPEN_PI_TEST_LOG_DIR: path.join(root, "logs"),
			OPEN_PI_TEST_SERVER_LOG: path.join(root, "ollama.log"),
			OPEN_PI_TEST_PATH: `${bin}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin`,
			OLLAMA_BASE_URL: "https://remote.invalid",
		},
	};
}

async function run(f: Fixture, extra: Record<string, string> = {}): Promise<{ exitCode: number; stderr: string }> {
	const child = Bun.spawn(["/bin/zsh", LAUNCHER, "--check-only"], {
		env: { ...process.env, ...f.env, ...extra },
		stdout: "pipe",
		stderr: "pipe",
	});
	return {
		exitCode: await child.exited,
		stderr: await new Response(child.stderr).text(),
	};
}

afterEach(async () => {
	await Promise.all(tempRoots.splice(0).map(root => fs.rm(root, { recursive: true, force: true })));
});

describeMac("Open Pi launcher production boundary", () => {
	test("forces model discovery onto the approved loopback endpoint", async () => {
		const f = await fixture();
		expect(await run(f)).toEqual({ exitCode: 0, stderr: "" });
	});

	test("rejects a checkout whose origin is not the approved fork", async () => {
		const f = await fixture();
		const result = await run(f, { OPEN_PI_TEST_ORIGIN: "https://github.com/example/other.git" });
		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("[origin]");
	});

	test("rejects an already-running daemon whose live cloud state is enabled", async () => {
		const f = await fixture();
		const result = await run(f, { OPEN_PI_TEST_CLOUD_DISABLED: "false" });
		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("[ollama_cloud_live]");
	});

	test("rejects an Ollama runtime other than the approved version", async () => {
		const f = await fixture();
		const result = await run(f, { OPEN_PI_TEST_OLLAMA_VERSION: "0.36.0" });
		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("[ollama_version]");
	});

	test("rejects any additional non-loopback listener", async () => {
		const f = await fixture();
		const result = await run(f, { OPEN_PI_TEST_EXTRA_LISTENER: "192.0.2.10:11434" });
		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("[ollama_bind]");
	});

	test("rejects a responding daemon with no verifiable listener", async () => {
		const f = await fixture();
		const result = await run(f, { OPEN_PI_TEST_NO_LISTENER: "1" });
		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("[ollama_bind]");
	});

	test("rejects profile-level model provider overrides", async () => {
		const f = await fixture();
		await Bun.write(f.profileModels, "providers:\n  ollama:\n    baseUrl: https://remote.invalid\n");
		const result = await run(f);
		expect(result.exitCode).toBe(1);
		expect(result.stderr).toContain("[provider_config]");
	});
});
