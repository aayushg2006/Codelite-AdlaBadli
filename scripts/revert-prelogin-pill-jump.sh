#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_REF="${1:-6c71d11}"

if ! git -C "$ROOT_DIR" rev-parse --verify "$BASE_REF^{commit}" >/dev/null 2>&1; then
  echo "Commit ref not found: $BASE_REF"
  echo "Usage: ./scripts/revert-prelogin-pill-jump.sh [commit-ref]"
  exit 1
fi

git -C "$ROOT_DIR" restore --source "$BASE_REF" \
  -- frontend/React_01/src/pages/Entry.jsx frontend/React_01/src/index.css

echo "Prelogin white-pill jump changes restored from $BASE_REF."
