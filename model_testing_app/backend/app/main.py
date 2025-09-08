
import os
from dotenv import load_dotenv
ok = load_dotenv()
print("load_dotenv() вернул:", ok)
print("MODELS =", os.getenv("MODELS"))
print("CORS   =", os.getenv("CORS"))


# backend/app/main.py
from pathlib import Path
from dotenv import load_dotenv

# Загружаем .env РАНЬШЕ любых импортов, которые читают os.getenv
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

import os
import asyncio
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import InferRequest, InferResponse, ModelInfo
from .model_registry import REGISTRY, DEVICE
from .detector import decode_data_url_to_bgr, run_infer
from .external_client import fire_and_forget_json, send_violation

from .tracker import SimpleTracker
from .violations_logic import ViolationThrottler, BatchQueue, ViolationRules

import cv2  # для отрисовки боксов на кадре

# ----------------- ENV / дефолты -----------------
ALLOWED_ORIGINS = os.getenv(
    "CORS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174"
).split(",")

# дефолтные поля для /violations/, если фронт не передал их в options
DEFAULT_DRIVER_ID = int(os.getenv("DEFAULT_DRIVER_ID", "123"))
DEFAULT_CAR_ID = int(os.getenv("DEFAULT_CAR_ID", "456"))
DEFAULT_PASSENGERS = int(os.getenv("DEFAULT_PASSENGERS", "1"))
DEFAULT_LAT = float(os.getenv("DEFAULT_LAT", "55.7558"))
DEFAULT_LON = float(os.getenv("DEFAULT_LON", "37.6176"))
DEFAULT_SPEED = int(os.getenv("DEFAULT_SPEED", "0"))
DEFAULT_LOCATION = os.getenv("DEFAULT_LOCATION", "Moscow, RU")

# троттлинг и батчинг
THROTTLE_SECONDS = float(os.getenv("THROTTLE_SECONDS", "60"))       # не чаще 1 раза в минуту на ключ
BATCH_FLUSH_SECONDS = float(os.getenv("BATCH_FLUSH_SECONDS", "2"))  # флаш раз в N сек
BATCH_MAX = int(os.getenv("BATCH_MAX", "20"))                       # макс. элементов за флаш
SEATBELT_WINDOW_MS = int(os.getenv("SEATBELT_WINDOW_MS", "3000"))   # окно «ремень присутствовал» (мс)

# маппинг классов модели -> violation_type_id эндпоинта /violations/
# ПОПРАВЬ под свои ID (пример ниже)
VIOLATION_MAP_BY_NAME = {
    "smoking": 2,
    "phone": 3,
    "seatbelt": 1,  # этот id используется для «ремень не пристёгнут»
    "sleepy": 4,
}
VIOLATION_MAP_BY_ID = {
    # 0: 4,  # пример: класс 0 -> нарушение 4
}

# ----------------- APP -----------------
app = FastAPI(title="YOLOv8n Inference API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Глобальное состояние -----------------
SESSION_TRACKERS: dict[str, SimpleTracker] = {}
SESSION_THROTTLERS: dict[str, ViolationThrottler] = {}
BATCHER: BatchQueue | None = None
BATCHER_TASK: asyncio.Task | None = None


@app.on_event("startup")
async def _startup():
    """Поднимаем фоновый батчер, который шлёт записи на /violations/."""
    global BATCHER, BATCHER_TASK
    BATCHER = BatchQueue(flush_interval_sec=BATCH_FLUSH_SECONDS, max_batch=BATCH_MAX)

    async def _sender(photo_bytes, fields):
        # одна запись — один POST multipart/form-data
        await send_violation(photo_bytes, fields)

    BATCHER.sender = _sender
    BATCHER_TASK = asyncio.create_task(BATCHER.run())


@app.on_event("shutdown")
async def _shutdown():
    """Останавливаем батчер корректно."""
    global BATCHER_TASK
    if BATCHER_TASK:
        BATCHER_TASK.cancel()
        try:
            await BATCHER_TASK
        except Exception:
            pass


# ----------------- API -----------------
@app.get("/api/health")
async def health():
    return {"status": "ok", "device": DEVICE}


@app.get("/api/models", response_model=list[ModelInfo])
async def list_models():
    return [
        ModelInfo(id=m["id"], title=m["title"], description=m["description"])
        for m in REGISTRY.list()
    ]


@app.post("/api/infer", response_model=InferResponse)
async def infer(req: InferRequest):
    # ---- модель ----
    try:
        model = REGISTRY.get(req.modelId)
    except KeyError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # ---- изображение ----
    try:
        bgr = decode_data_url_to_bgr(req.imageBase64)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Bad image: {e}")

    # ---- порог ----
    conf = 0.25
    if req.options and isinstance(req.options.get("scoreThreshold"), (int, float)):
        conf = float(req.options["scoreThreshold"])

    # ---- инференс ----
    detections, meta = run_infer(model, bgr, conf=conf)

    # ---- «псевдотрекинг» по sessionId (IoU) ----
    tracker = SESSION_TRACKERS.setdefault(req.sessionId, SimpleTracker())
    det_dicts = [
        {
            "x": float(d.x),
            "y": float(d.y),
            "w": float(d.w),
            "h": float(d.h),
            "score": float(d.score),
            "cls": d.cls,
            "cls_id": int(d.cls_id),
        }
        for d in detections
    ]
    det_tracked = tracker.update(det_dicts, req.frameTsMs, iou_thresh=0.5)

    # ---- правила нарушений ----
    rules = ViolationRules(
        by_name=VIOLATION_MAP_BY_NAME,
        by_id=VIOLATION_MAP_BY_ID,
        seatbelt_present_names=["seatbelt"],
        seatbelt_window_ms=SEATBELT_WINDOW_MS,
    )
    events = rules.compute(det_tracked, tracker, req.frameTsMs)
    # events: List[ (track_id | None, violation_type_id: int, confidence: float) ]

    # ---- подготовка фото (только если есть события) ----
    photo_bytes = b""
    if events:
        draw = bgr.copy()
        for d in det_tracked:
            x, y, w, h = int(d["x"]), int(d["y"]), int(d["w"]), int(d["h"])
            cv2.rectangle(draw, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(
                draw,
                f"{d['cls']} {d['score']:.2f}",
                (x, max(0, y - 6)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 0),
                2,
            )
        ok, jpg = cv2.imencode(".jpg", draw)
        if ok:
            photo_bytes = jpg.tobytes()

    # ---- параметры для /violations/ ----
    opts = req.options or {}
    driver_id = int(opts.get("driver_id", DEFAULT_DRIVER_ID))
    car_id = int(opts.get("car_id", DEFAULT_CAR_ID))
    passengers = int(opts.get("passengers", DEFAULT_PASSENGERS))
    lat = float(opts.get("lat", DEFAULT_LAT))
    lon = float(opts.get("lon", DEFAULT_LON))
    speed = int(opts.get("speed", DEFAULT_SPEED))
    location = str(opts.get("location", DEFAULT_LOCATION))
    iso_time = str(opts.get("time", datetime.utcnow().isoformat()))

    # ---- троттлинг и постановка в батч-очередь ----
    throttler = SESSION_THROTTLERS.setdefault(
        req.sessionId, ViolationThrottler(min_interval_sec=THROTTLE_SECONDS)
    )

    if events and BATCHER and photo_bytes:
        for track_id, violation_type_id, confv in events:
            key = f"{req.sessionId}:{violation_type_id}:{track_id or 'na'}"
            if throttler.should_send(key):
                fields = {
                    "driver_id": driver_id,
                    "car_id": car_id,
                    "passengers": passengers,
                    "violation_type_id": int(violation_type_id),
                    "lat": lat,
                    "lon": lon,
                    "speed": speed,
                    "confidence": float(confv),
                    "location": location,
                    "time": iso_time,
                }
                await BATCHER.put(photo_bytes, fields)

    # ---- (опционально) JSON-инжест как раньше ----
    payload = {
        "sessionId": req.sessionId,
        "modelId": req.modelId,
        "frameTsMs": req.frameTsMs,
        "detections": det_tracked,  # уже с track_id
        "meta": meta,
    }
    await fire_and_forget_json(payload)

    # ---- ответ фронту (детекции — как объекты pydantic) ----
    return InferResponse(
        modelId=req.modelId,
        frameTsMs=req.frameTsMs,
        detections=detections,
        meta=meta,
    )

