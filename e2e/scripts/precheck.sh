#!/usr/bin/env bash
# The checks CI's e2e jobs run before any test (.github/workflows/e2e.yml and the
# enterprise suite's own): lint and type-check the suite, and the API types
# being current with the backend's routes. Run it before pushing: these fail in
# seconds here instead of minutes into CI.
#
#   scripts/precheck.sh
#
# E2E_NODE_MODULES points at an installed e2e/node_modules when this checkout has
# none (a git worktree); E2E_PYTHON at a Python with the backend's requirements.
set -euo pipefail

E2E_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENTERPRISE_E2E="$E2E_DIR/../frontend/src/modules/enterprise/e2e"
cd "$E2E_DIR"

if [[ ! -e node_modules ]]; then
  [[ -n "${E2E_NODE_MODULES:-}" && -d "$E2E_NODE_MODULES" ]] \
    || { echo "precheck: no e2e/node_modules here; run npm ci or set E2E_NODE_MODULES" >&2; exit 1; }
  ln -s "$E2E_NODE_MODULES" node_modules
  trap 'rm -f "$E2E_DIR/node_modules"' EXIT
fi

step() { echo "precheck: $1" >&2; }

step "lint and type-check the suite"
npm run --silent lint
node_modules/.bin/tsc --noEmit

step "API types are up to date"
./scripts/api-types.sh --check

if [[ -d "$ENTERPRISE_E2E" ]]; then
  step "lint and type-check the enterprise suite"
  npm run --silent lint:enterprise
  node_modules/.bin/tsc --noEmit -p "$ENTERPRISE_E2E/tsconfig.json"
fi

step "all passed"
