#!/usr/bin/env bash
set -euo pipefail

IMAGE="${IMAGE:-killfyvibecoding/zhice-ai:latest}"
CONTAINER="${CONTAINER:-zhice-ai}"
PORT="${PORT:-3003}"
DATA_DIR="${DATA_DIR:-./zhice-ai-data}"

if [[ -z "${AUTH_SECRET:-}" ]]; then
  echo "AUTH_SECRET is required. Example: AUTH_SECRET=\"$(openssl rand -base64 32)\" $0" >&2
  exit 1
fi

docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
mkdir -p "$DATA_DIR"

docker run -d \
  --name "$CONTAINER" \
  --platform linux/amd64 \
  -p "${PORT}:3000" \
  -e "AUTH_SECRET=${AUTH_SECRET}" \
  -v "$(pwd)/${DATA_DIR}:/app/data" \
  "$IMAGE"

echo "Zhice AI is running at http://localhost:${PORT}"
