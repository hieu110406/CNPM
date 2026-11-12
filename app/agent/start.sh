#!/usr/bin/env bash
set -euo pipefail
ollama serve &
ollama_pid=$!
api_pid=""
cleanup() {
  kill "$ollama_pid" ${api_pid:+"$api_pid"} 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 143' TERM INT
for attempt in {1..60}; do
  if ollama list >/dev/null 2>&1; then break; fi
  kill -0 "$ollama_pid"
  sleep 1
done
ollama list >/dev/null
# Reuse the persistent model without requiring registry access on each restart.
if ! ollama show "$OLLAMA_MODEL" >/dev/null 2>&1; then
  ollama pull "$OLLAMA_MODEL"
fi
uvicorn translat_bot:app --host 0.0.0.0 --port "${PORT:-10000}" &
api_pid=$!
wait -n "$ollama_pid" "$api_pid"
