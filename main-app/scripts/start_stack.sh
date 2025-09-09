#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------
# Monitoring Safety: one-click stack bootstrap
# Run this from the REPO ROOT:
#   ./scripts/start_stack.sh
# ---------------------------------------------

# --- Compose files (relative to repo root) ---
INFRA_COMPOSE="./main-app/db/docker-compose.yml"          # Postgres + MinIO
BACKEND_COMPOSE="./main-app/backend/docker-compose.yml"      # taxifleet + violations
FRONTEND_COMPOSE="./main-app/frontend/frontend-compose.yml"  # Nginx (serves Vite static)

# --- Network & container names ---
NETWORK_NAME="dispatcher_net"
PG_CONTAINER="dispatcher_postgres"
MINIO_CONTAINER="dispatcher_minio"

# --- Host ports exposed by your services ---
TAXIFLEET_PORT=8001
VIOLATIONS_PORT=8002
FRONTEND_PORT=5173

# -------------- helpers --------------
die() { echo "❌ $*" >&2; exit 1; }

need_file() { [[ -f "$1" ]] || die "Missing file: $1"; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Command not found: $1"
}

wait_for_tcp() {
  local host="$1" port="$2" timeout="${3:-30}"
  local i
  for ((i=1; i<=timeout; i++)); do
    if command -v nc >/dev/null 2>&1; then
      if nc -z "$host" "$port" >/dev/null 2>&1; then return 0; fi
    else
      # Bash /dev/tcp fallback
      if (echo >"/dev/tcp/${host}/${port}") >/dev/null 2>&1; then return 0; fi
    fi
    sleep 1
  done
  return 1
}

# -------------- preflight --------------
need_cmd docker
need_cmd bash

need_file "$INFRA_COMPOSE"
need_file "$BACKEND_COMPOSE"
need_file "$FRONTEND_COMPOSE"

echo "▶️  Creating docker network '${NETWORK_NAME}' (if missing)..."
docker network create "${NETWORK_NAME}" >/dev/null 2>&1 || true

# -------------- infra --------------
echo "▶️  Bringing up INFRA (Postgres + MinIO)..."
docker compose -f "${INFRA_COMPOSE}" up -d --build

echo "🔌 Ensuring network aliases (db, minio) on '${NETWORK_NAME}'..."
docker network connect --alias db    "${NETWORK_NAME}" "${PG_CONTAINER}"    >/dev/null 2>&1 || true
docker network connect --alias minio "${NETWORK_NAME}" "${MINIO_CONTAINER}" >/dev/null 2>&1 || true

echo "⏳ Waiting for Postgres to be ready..."
for i in {1..60}; do
  if docker exec "${PG_CONTAINER}" pg_isready -U dispatcher -d dispatcher_db >/dev/null 2>&1; then
    echo "✅ Postgres is ready"
    break
  fi
  sleep 1
  if [[ $i -eq 60 ]]; then
    die "Postgres didn't become ready. See logs: docker logs ${PG_CONTAINER}"
  fi
done

echo "⏳ Waiting for MinIO on localhost:9000 ..."
if wait_for_tcp "localhost" 9000 30; then
  echo "✅ MinIO port 9000 is reachable on host"
else
  echo "⚠️  Could not confirm MinIO on port 9000 (continuing). Check: docker logs ${MINIO_CONTAINER}"
fi

# -------------- backends --------------
echo "▶️  Bringing up BACKENDS (taxifleet + violations)..."
docker compose -f "${BACKEND_COMPOSE}" up -d --build

echo "⏳ Waiting for API OpenAPI endpoints..."
for i in {1..60}; do
  if curl -sf "http://localhost:${TAXIFLEET_PORT}/openapi.json" >/dev/null 2>&1 &&      curl -sf "http://localhost:${VIOLATIONS_PORT}/openapi.json" >/dev/null 2>&1; then
    echo "✅ Backend APIs are responding"
    break
  fi
  sleep 1
  if [[ $i -eq 60 ]]; then
    echo "❌ Backends didn't respond in time."
    echo "   > docker logs taxifleet_api --tail=100"
    echo "   > docker logs violations_api --tail=100"
    exit 1
  fi
done

# -------------- frontend --------------
echo "▶️  Bringing up FRONTEND (Nginx + Vite static)..."
docker compose -f "${FRONTEND_COMPOSE}" up -d --build

echo
echo "🎉 All services are up!"
echo "   Frontend:            http://localhost:${FRONTEND_PORT}"
echo "   Taxifleet API docs:  http://localhost:${TAXIFLEET_PORT}/docs"
echo "   Violations API docs: http://localhost:${VIOLATIONS_PORT}/docs"
echo
echo "ℹ️  Next step: load test data into Postgres from init.sql (run from repo root):"
echo "   docker exec -i ${PG_CONTAINER} psql -U dispatcher -d dispatcher_db < ./main-app/infra/init.sql"
echo
