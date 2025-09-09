# Monitoring Safety — App Stack (Docker)

This document describes how to run the full stack — **infrastructure (Postgres + MinIO)**, **backends (FastAPI)**, and **frontend (Vite static served by Nginx)** — using Docker.

> From the repository root README, add a short pointer to this file.

---

## Components

- **Infra:** Postgres 15 (`dispatcher_postgres`), MinIO (`dispatcher_minio`)
- **Backends:**
  - `taxifleet_api` (exposed on **:8001**)
  - `violations_api` (exposed on **:8002**)
- **Frontend:** Nginx serving Vite build (exposed on **:5173**)

### Folder layout (relevant parts)

```
main-app/
  infra/
    docker-compose.yml
    init.sql
  backend/
    docker-compose.yml
    ... (service folders / Dockerfiles / .env files)
  frontend/
    Dockerfile
    nginx.conf
    frontend-compose.yml
    package.json
    src/
    index.html
```

---

## Quick start (recommended)

From the **repository root**:

```bash
./scripts/start_stack.sh
```

The script will:

1. Create a Docker network `dispatcher_net` (if missing).
2. Bring up **infra** (Postgres + MinIO).
3. Attach network aliases: `db` → Postgres, `minio` → MinIO.
4. Wait for services to become ready.
5. Bring up **backends** and wait for their OpenAPI endpoints.
6. Bring up the **frontend**.

After a successful start, open:

- Frontend: **http://localhost:5173**  
- Taxifleet API docs: **http://localhost:8001/docs**  
- Violations API docs: **http://localhost:8002/docs**  

### Load test data

If `init.sql` wasn’t applied automatically on first run, load it manually:

```bash
# run from the repository root
docker exec -i dispatcher_postgres psql -U dispatcher -d dispatcher_db < ./main-app/infra/init.sql
```

Verify data is present, for example:

```bash
docker exec -it dispatcher_postgres psql -U dispatcher -d dispatcher_db -c "SELECT COUNT(*) FROM violations;"
```

---

## Run step-by-step (manual)

### 1) Create a common network
```bash
docker network create dispatcher_net || true
```

### 2) Infra: Postgres + MinIO
```bash
docker compose -f ./main-app/db/docker-compose.yml up -d --build

# (optional but recommended) add friendly aliases
docker network connect --alias db dispatcher_net dispatcher_postgres   || true
docker network connect --alias minio dispatcher_net dispatcher_minio   || true
```

### 3) Backends

Ensure backend `.env` files use **container** hostnames, not localhost:

- DB (async): `postgresql+asyncpg://dispatcher:secret123@dispatcher_postgres:5432/dispatcher_db`
- MinIO (boto3): `S3_ENDPOINT=http://minio:9000` (hostnames with `_` are invalid in URLs)

Bring them up:

```bash
docker compose -f ./main-app/backend/docker-compose.yml up -d --build
```

Check they respond:

```bash
curl -s http://localhost:8001/openapi.json | jq .info
curl -s http://localhost:8002/openapi.json | jq .info
```

### 4) Frontend

```bash
docker compose -f ./main-app/frontend/frontend-compose.yml up -d --build
# open
open http://localhost:5173  # on macOS
```

> This setup serves the frontend as static files and the **browser** calls the APIs at `http://localhost:8001` and `http://localhost:8002`.  
> To avoid CORS entirely, you can configure nginx in the frontend container to reverse-proxy `/api` → `taxifleet_api:8001` and `/upload` → `violations_api:8002`, and attach the frontend to the same Docker network.

---

## Notes & Troubleshooting

- **S3 “Invalid endpoint”**: URLs cannot contain `_`. Use `http://minio:9000` and give the MinIO container a network alias `minio`.
- **DB “Connection refused / name not known”**: Use the container name `dispatcher_postgres` (or a network alias like `db`) in `DATABASE_URL`.
- **CORS from frontend**: When serving frontend separately, ensure FastAPI has:
  ```python
  from fastapi.middleware.cors import CORSMiddleware

  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:5173"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
- **Pydantic v2 warning**: replace `orm_mode=True` with `model_config = ConfigDict(from_attributes=True)`.
- **NULL data causing 500** (e.g., `passengers`): coalesce to defaults in queries or make the field optional in the output schema.

### Useful checks

```bash
# DB readiness
docker exec dispatcher_postgres pg_isready -U dispatcher -d dispatcher_db

# MinIO port (host)
nc -zv localhost 9000

# Env inside containers
docker exec taxifleet_api  printenv | egrep 'DATABASE_URL|S3_ENDPOINT'
docker exec violations_api printenv | egrep 'DATABASE_URL|POSTGRES_HOST|S3_ENDPOINT'

# Docs
open http://localhost:8001/docs
open http://localhost:8002/docs
```

---

## Repository root README

In the repository root `README.md`, add a short pointer:

```md
For the full runbook, see [main-app/README.md](./main-app/README.md).

Quick start:
\`\`\`bash
./scripts/start_stack.sh
\`\`\`
After the stack is up, load test data from \`main-app/db/init.sql\`.
```
