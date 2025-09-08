# TaxiFleet DB Infrastructure

## 📦 Services
- PostgreSQL (port 5432)
- MinIO (port 9000, UI — 9001)

## ▶️ Launch

```bash
cd db
docker-compose up -d
```

## 🔐 DB Access

- host: localhost
- port: 5432
- user: dispatcher
- password: secret123
- database: dispatcher_db

## 🗂️ MinIO Access

- URL: http://localhost:9001
- user: minioadmin
- password: minioadmin

Create a bucket `violations` after login.
