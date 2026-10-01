#!/bin/zsh
set -euo pipefail
umask 077
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

readonly REPO_DEFAULT="/Users/mikkohchen/Developer/frictionless-labs/oh-my-pi"
readonly PROFILE="frictionless-local"
readonly MODEL="qwen3-coder:30b"
readonly MODEL_SELECTOR="ollama/qwen3-coder:30b"
readonly MODEL_DIGEST="06c1097efce0431c2045fe7b2e5108366e43bee1b4603a7aded8f21689e90bca"
readonly BUN_DEFAULT="/Users/mikkohchen/.bun/bin/bun"
readonly OLLAMA_DEFAULT="/Applications/Ollama.app/Contents/Resources/ollama"
readonly APPROVED_DEFAULT="/Users/mikkohchen/.omp/profiles/frictionless-local/approved-sha"
readonly PROFILE_CONFIG="/Users/mikkohchen/.omp/profiles/frictionless-local/agent/config.yml"
readonly SERVER_CONFIG="/Users/mikkohchen/.ollama/server.json"
readonly LOG_DIR="/Users/mikkohchen/.omp/profiles/frictionless-local/logs"
readonly LOG_FILE="${LOG_DIR}/Open-Pi.log"
readonly SERVER_LOG="/Users/mikkohchen/.ollama/logs/open-pi-server.log"

mode="${1:-launch}"
repo="$REPO_DEFAULT"
bun_bin="$BUN_DEFAULT"
ollama_bin="$OLLAMA_DEFAULT"
approved_file="$APPROVED_DEFAULT"
expected_model="$MODEL"
expected_selector="$MODEL_SELECTOR"
expected_digest="$MODEL_DIGEST"
autostart=1

if [[ "${OPEN_PI_TEST_MODE:-0}" == "1" && "$mode" == "--check-only" ]]; then
  repo="${OPEN_PI_TEST_REPO:-$repo}"
  bun_bin="${OPEN_PI_TEST_BUN_BIN:-$bun_bin}"
  ollama_bin="${OPEN_PI_TEST_OLLAMA_BIN:-$ollama_bin}"
  approved_file="${OPEN_PI_TEST_APPROVED_FILE:-$approved_file}"
  expected_model="${OPEN_PI_TEST_MODEL:-$expected_model}"
  expected_selector="ollama/${expected_model}"
  expected_digest="${OPEN_PI_TEST_DIGEST:-$expected_digest}"
  autostart="${OPEN_PI_TEST_AUTOSTART:-$autostart}"
fi

mkdir -p "$LOG_DIR" "/Users/mikkohchen/.ollama/logs"

log_event() {
  print -r -- "$(date -u +%Y-%m-%dT%H:%M:%SZ) event=$1" >> "$LOG_FILE"
}

fail() {
  local code="$1"
  local message="$2"
  log_event "blocked_${code}"
  print -u2 -r -- "Open Pi blocked [${code}]: ${message}"
  exit 1
}

[[ "$mode" == "launch" || "$mode" == "--check-only" ]] ||
  fail "usage" "Use Open-Pi.command or Open-Pi.command --check-only."

[[ -d "$repo/.git" ]] ||
  fail "repository_missing" "Restore the canonical repository at ${repo}."

root="$(git -C "$repo" rev-parse --show-toplevel 2>/dev/null)" ||
  fail "repository_invalid" "The canonical path is not a readable Git checkout."
[[ "$root" == "$repo" ]] ||
  fail "repository_root" "Git resolved ${root}; expected ${repo}."

branch="$(git -C "$repo" branch --show-current)"
[[ "$branch" == "main" ]] ||
  fail "branch" "Switch the canonical checkout to main; found ${branch:-detached}."

dirty="$(git -C "$repo" status --porcelain)"
[[ -z "$dirty" ]] ||
  fail "dirty" "Commit, stash, or remove repository changes before launch."

[[ -f "$approved_file" ]] ||
  fail "approval_missing" "The production approved-SHA file is missing; rerun the release installation."
approved_owner="$(stat -f '%Su' "$approved_file")"
approved_mode="$(stat -f '%Lp' "$approved_file")"
[[ "$approved_owner" == "$(id -un)" ]] ||
  fail "approval_owner" "The approved-SHA file is not owned by the current user."
(( (8#$approved_mode & 8#022) == 0 )) ||
  fail "approval_mode" "Remove group/other write access from the approved-SHA file."
approved_sha="$(tr -d '[:space:]' < "$approved_file")"
[[ "$approved_sha" =~ '^[0-9a-f]{40}$' ]] ||
  fail "approval_format" "The approved-SHA file does not contain one full Git SHA."
head_sha="$(git -C "$repo" rev-parse HEAD)"
[[ "$head_sha" == "$approved_sha" ]] ||
  fail "sha" "Repository HEAD ${head_sha} is not the approved release ${approved_sha}."

[[ -x "$bun_bin" ]] ||
  fail "bun_missing" "Install the repository-required Bun runtime at ${bun_bin}."
bun_version="$("$bun_bin" --version)"
bun_major="${bun_version%%.*}"
bun_remainder="${bun_version#*.}"
bun_minor="${bun_remainder%%.*}"
[[ "$bun_major" == <-> && "$bun_minor" == <-> ]] ||
  fail "bun_version" "Bun returned an unreadable version: ${bun_version}."
(( bun_major > 1 || (bun_major == 1 && bun_minor >= 4) )) ||
  fail "bun_version" "Bun 1.4 or newer is required; found ${bun_version}."

[[ -d "$repo/node_modules" ]] ||
  fail "dependencies" "Run bun install --frozen-lockfile in the canonical repository."
[[ -f "$repo/packages/natives/native/pi_natives.darwin-arm64.node" ]] ||
  fail "native_asset" "Run bun --cwd=packages/natives run build in the canonical repository."
[[ -s "$repo/packages/coding-agent/src/export/html/tool-views.generated.js" ]] ||
  fail "generated_asset" "Run bun run gen:tool-views in the canonical repository."

[[ -x "$ollama_bin" ]] ||
  fail "ollama_missing" "Install the notarized Ollama macOS application in /Applications."
[[ -f "$SERVER_CONFIG" ]] ||
  fail "ollama_config" "Create ~/.ollama/server.json with disable_ollama_cloud set to true."
jq -e '.disable_ollama_cloud == true' "$SERVER_CONFIG" >/dev/null ||
  fail "ollama_cloud" "Set disable_ollama_cloud to true in ~/.ollama/server.json."
[[ -f "$PROFILE_CONFIG" ]] ||
  fail "profile_config" "Restore the isolated frictionless-local OMP profile."

if ! curl -fsS --max-time 2 http://127.0.0.1:11434/api/version >/dev/null; then
  [[ "$autostart" == "1" ]] ||
    fail "ollama_stopped" "Start Ollama with cloud disabled on 127.0.0.1:11434."
  log_event "ollama_start"
  env OLLAMA_NO_CLOUD=1 OLLAMA_HOST=127.0.0.1:11434 OLLAMA_DEBUG_LOG_REQUESTS=false     nohup "$ollama_bin" serve >> "$SERVER_LOG" 2>&1 </dev/null &
  for _attempt in {1..30}; do
    curl -fsS --max-time 2 http://127.0.0.1:11434/api/version >/dev/null && break
    sleep 1
  done
fi
curl -fsS --max-time 2 http://127.0.0.1:11434/api/version >/dev/null ||
  fail "ollama_unreachable" "Ollama did not start; inspect ${SERVER_LOG}."

listener="$(lsof -nP -iTCP:11434 -sTCP:LISTEN 2>/dev/null)"
[[ "$listener" == *"127.0.0.1:11434 (LISTEN)"* ]] ||
  fail "ollama_bind" "Ollama must listen only on 127.0.0.1:11434."
[[ "$listener" != *"*:11434 (LISTEN)"* ]] ||
  fail "ollama_bind" "Ollama is exposed beyond loopback; remove the OLLAMA_HOST override."

model_record="$(curl -fsS --max-time 5 http://127.0.0.1:11434/api/tags |
  jq -er --arg model "$expected_model" '.models[] | select(.name == $model) | [.name, .digest] | @tsv')" ||
  fail "model_missing" "Pull ${expected_model} with the official Ollama CLI."
model_name="${model_record%%$'\t'*}"
model_digest="${model_record#*$'\t'}"
[[ "$model_name" == "$expected_model" && "$model_digest" == "$expected_digest" ]] ||
  fail "model_digest" "Installed model digest is not the approved immutable digest."

models_json="$(env OLLAMA_NO_CLOUD=1 OLLAMA_HOST=127.0.0.1:11434 OTEL_SDK_DISABLED=true   "$bun_bin" "$repo/packages/coding-agent/src/cli.ts" --profile "$PROFILE" models --json)"
jq -e --arg selector "$expected_selector" '
  (.models | length) == 1 and
  .models[0].provider == "ollama" and
  ("ollama/" + .models[0].id) == $selector
' <<< "$models_json" >/dev/null ||
  fail "provider_scope" "The frictionless-local profile must expose only ${expected_selector}."

version="$(jq -er '.version' "$repo/packages/coding-agent/package.json")"
log_event "preflight_pass"
print -r -- "Open Pi ${version} verified: ${expected_selector} @ ${head_sha[1,12]}"

[[ "$mode" == "--check-only" ]] && exit 0

export OLLAMA_NO_CLOUD=1
export OLLAMA_HOST=127.0.0.1:11434
export OLLAMA_BASE_URL=http://127.0.0.1:11434
export OTEL_SDK_DISABLED=true
export OMP_PROFILE="$PROFILE"
cd "$repo"
exec "$bun_bin" "$repo/packages/coding-agent/src/cli.ts" --profile "$PROFILE" --model "$expected_selector"
