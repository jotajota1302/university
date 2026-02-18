#!/usr/bin/env bash
set -euo pipefail

if [ -z "${UNIVERSITY_TOKEN:-}" ]; then
  echo "Error: UNIVERSITY_TOKEN environment variable is not set." >&2
  exit 1
fi

if [ -z "${UNIVERSITY_API_URL:-}" ]; then
  echo "Error: UNIVERSITY_API_URL environment variable is not set." >&2
  exit 1
fi

# Read agent files if they exist
SOUL=""
AGENTS=""
TOOLS=""
MEMORY=""

if [ -f "SOUL.md" ]; then
  SOUL=$(cat SOUL.md)
fi

if [ -f "AGENTS.md" ]; then
  AGENTS=$(cat AGENTS.md)
fi

if [ -f "TOOLS.md" ]; then
  TOOLS=$(cat TOOLS.md)
fi

if [ -f "MEMORY.md" ]; then
  MEMORY=$(cat MEMORY.md)
fi

# Build JSON payload using jq for proper escaping
PAYLOAD=$(jq -n \
  --arg soul "$SOUL" \
  --arg agents "$AGENTS" \
  --arg tools "$TOOLS" \
  --arg memory "$MEMORY" \
  '{files: {"SOUL.md": $soul, "AGENTS.md": $agents, "TOOLS.md": $tools, "memory": $memory}}')

# Send to University API
curl -s -X POST "${UNIVERSITY_API_URL}/v1/audit/gdpr" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${UNIVERSITY_TOKEN}" \
  -d "$PAYLOAD"
