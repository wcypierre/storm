#!/usr/bin/env bash
# PostToolUse hook: runs this repo's CI checks when Claude edits a file in
# this repo. Exits 2 on failure so the registered asyncRewake hook feeds the
# failure output back to Claude. Skips silently for edits under .claude/,
# .git/, or node_modules/, and for files outside this repo.
#
# Registered from .claude/settings.json. To inspect or disable, run /hooks
# inside Claude Code.

set -u

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/../.." && pwd)"

file_path=$(node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
  try{const j=JSON.parse(s);process.stdout.write(j.tool_input&&j.tool_input.file_path?String(j.tool_input.file_path):"");}
  catch(e){process.stdout.write("");}
});' 2>/dev/null)

[ -z "$file_path" ] && exit 0

# Normalize Windows paths (C:\... or c:/...) to /c/... for consistent matching.
norm=$(printf '%s' "$file_path" | tr '\\' '/' | sed -E 's#^([a-zA-Z]):/#/\L\1/#')

case "$norm" in "$REPO_ROOT"/*) ;; *) exit 0 ;; esac
case "$norm" in *"/.claude/"*|*"/.git/"*|*"/node_modules/"*|*"/vendor/"*) exit 0 ;; esac

SENTINEL=/tmp/claude-ci-$(printf '%s' "$REPO_ROOT" | sed 's#[^a-zA-Z0-9]#_#g').lock
if [ -f "$SENTINEL" ]; then
  pid=$(cat "$SENTINEL" 2>/dev/null || true)
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then exit 0; fi
fi
echo $$ > "$SENTINEL"
trap 'rm -f "$SENTINEL"' EXIT

cd "$REPO_ROOT"
vet_out=$(go vet ./... 2>&1);   vet_rc=$?
test_out=$(go test ./... 2>&1); test_rc=$?

if [ "$vet_rc" -ne 0 ] || [ "$test_rc" -ne 0 ]; then
  echo "CI hook failed in $(basename "$REPO_ROOT") — fix before continuing."
  echo "Triggered by edit to: $file_path"
  echo
  echo "=== go vet ./... (exit $vet_rc) ==="
  printf '%s\n' "$vet_out" | tail -40
  echo
  echo "=== go test ./... (exit $test_rc) ==="
  printf '%s\n' "$test_out" | tail -60
  exit 2
fi
exit 0
