# YOLO Video Detector (Backend + Frontend)

## 📌 What this project does
- Detects objects and violations on videos using YOLOv8 models (e.g., `driver`, `cabin`).
- Provides an API backend (FastAPI) and a web frontend (Vite + Nginx).
- Sends detected violations (`seatbelt`, `phone`, `smoking`, `sleepy`) to an external `/violations/` endpoint.
- Generates presigned URLs for violation photos (MinIO optional).
- Includes anti-spam throttling, simple tracking, and batching of violation events.

---

## 🚀 Run with Docker

### Option A: Run each container separately
**Backend (port 8003):**
```bash
cd backend
docker build -t yolo-backend-model .

docker run -d --name backend-model   -p 8003:8003   -e MODELS="driver=/models/driver_yolov8n.pt;cabin=/models/cabin_yolov8n.pt"   -e CORS="http://localhost:5174"   -e DEVICE="cpu"   -e VIOLATIONS_URL="http://localhost:8003/violations/"   -v /ABS/PATH/to/backend/app/models:/models:ro   yolo-backend-model

# later you can just stop/start:
docker stop backend-model
docker start backend-model
```

**Frontend (Nginx on port 80 → host 5174):**
```bash
cd frontend
docker build --build-arg VITE_API_BASE=http://localhost:8003 -t yolo-frontend-model .

docker run -d --name frontend-model -p 5174:80 yolo-frontend-model

# later:
docker stop frontend-model
docker start frontend-model
```

Access the app: <http://localhost:5174>

---

### Option B: Run with docker-compose (recommended)
Create `docker-compose.yml` in project root:

```yaml
services:
  backend:
    build: ./backend
    container_name: backend-model
    ports: ["8003:8003"]
    environment:
      - MODELS=driver=/models/driver_yolov8n.pt;cabin=/models/cabin_yolov8n.pt
      - CORS=http://localhost:5174
      - DEVICE=cpu
      - VIOLATIONS_URL=http://localhost:8003/violations/
    volumes:
      - ./backend/app/models:/models:ro

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_BASE: "http://localhost:8003"
    container_name: frontend-model
    ports: ["5174:80"]
```

Run:
```bash
docker compose up --build -d
docker compose ps
docker compose logs -f
```

Open: <http://localhost:5174>

---

## 💻 Run locally (without Docker)

### Backend
Requirements: Python 3.10+

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install torch --index-url https://download.pytorch.org/whl/cpu

# Configure backend/.env (example):
# MODELS=driver=./app/models/driver_yolov8n.pt;cabin=./app/models/cabin_yolov8n.pt
# DEVICE=cpu
# CORS=http://localhost:5174

uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8003 --reload
```

Check:
- API docs: <http://localhost:8003/docs>
- Models list: <http://localhost:8003/api/models>

### Frontend (Vite dev server)
Requirements: Node.js 20+

```bash
cd frontend
echo "VITE_API_BASE=http://localhost:8003" > .env
npm ci || npm install
npm run dev
```

Access: <http://localhost:5174>

### Frontend production build (optional)
```bash
cd frontend
npm run build
npx serve dist   # or any static server
```

---

## 🔑 Environment variables

**Backend (`.env`):**
```
MODELS=driver=./app/models/driver_yolov8n.pt;cabin=./app/models/cabin_yolov8n.pt
DEVICE=cpu
CORS=http://localhost:5174
VIOLATIONS_URL=http://localhost:8003/violations/
VIOLATIONS_TOKEN=

THROTTLE_SECONDS=90
SEATBELT_WINDOW_MS=5000
BATCH_FLUSH_SECONDS=2
BATCH_MAX=20

# MinIO (optional)
S3_ENDPOINT_INTERNAL=http://minio:9000
S3_ENDPOINT_PUBLIC=http://localhost:9000
S3_BUCKET=violations
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
```

**Frontend (`.env`):**
```
VITE_API_BASE=http://localhost:8003
```

---

## 🎬 Usage

1. **Open the frontend**  
   Go to <http://localhost:5174> (if running locally or via Docker).  

2. **Choose a model**  
   - Use the dropdown to select which YOLO model to run (e.g., `driver`, `cabin`).  

3. **Upload a video**  
   - Click the upload area or drag & drop a `.mp4` (or other supported video format).  
   - The video will appear in the interface.  

4. **Start processing**  
   - Click **Start / Run**.  
   - Frames are sent to the backend, which performs YOLOv8 inference.  

5. **View results**  
   - The processed video plays with bounding boxes around detected objects and violations.  
   - Stats (FPS, response time, detection counts) are displayed.  

6. **Violations reporting**  
   - Detected violations (`seatbelt`, `phone`, `smoking`, `sleepy`) are sent to `/violations/` service.  
   - Throttling prevents duplicate spam events.  
   - If MinIO is configured, presigned URLs are generated for violation snapshots.  

7. **Close / reset**  
   - When you close/reset the processed video, it is removed from browser cache.  
   - The server never stores the full video, only processes frames in memory.
