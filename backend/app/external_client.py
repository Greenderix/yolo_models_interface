# backend/app/external_client.py
import os
import asyncio
import httpx
from typing import Dict, Any, Optional, Tuple

# --- JSON-инжест (опционально, если используете) ---
EXTERNAL_URL = os.getenv("EXTERNAL_URL", "")
EXTERNAL_TOKEN = os.getenv("EXTERNAL_TOKEN", "")

# --- multipart /violations/ ---
VIOLATIONS_URL = os.getenv("VIOLATIONS_URL", "")  # напр. http://localhost:8003/violations/
VIOLATIONS_TOKEN = os.getenv("VIOLATIONS_TOKEN", "")

# сетевые настройки
HTTP_TIMEOUT = float(os.getenv("HTTP_TIMEOUT", "10"))         # сек
RETRIES = int(os.getenv("HTTP_RETRIES", "2"))                 # кол-во повторов при ошибках
RETRY_BACKOFF = float(os.getenv("HTTP_RETRY_BACKOFF", "0.4")) # базовая задержка между повторами

def _auth_header(token: str) -> Optional[dict]:
    return {"Authorization": f"Bearer {token}"} if token else None

async def _post_json(url: str, payload: Dict[str, Any], headers: Optional[dict] = None):
    if not url:
        return
    attempt = 0
    last_err: Optional[Exception] = None
    while attempt <= RETRIES:
        try:
            async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
                r = await client.post(url, json=payload, headers=headers)
                # считаем 2xx успехом
                if 200 <= r.status_code < 300:
                    return
                # для 5xx/429 попробуем ретрайнуть
                if r.status_code >= 500 or r.status_code == 429:
                    raise httpx.HTTPStatusError(f"{r.status_code} {r.text}", request=r.request, response=r)
                # остальное — не ретраим
                return
        except Exception as e:
            last_err = e
            if attempt == RETRIES:
                break
            await asyncio.sleep(RETRY_BACKOFF * (2 ** attempt))
            attempt += 1
    # тихо глотаем ошибку, чтобы не ломать инференс; при желании тут можно логировать
    _ = last_err

async def _post_multipart(
    url: str,
    files: Dict[str, Tuple[str, bytes, str]],
    data: Dict[str, Any],
    headers: Optional[dict] = None
):
    if not url:
        return
    attempt = 0
    last_err: Optional[Exception] = None
    while attempt <= RETRIES:
        try:
            async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
                r = await client.post(url, files=files, data=data, headers=headers)
                if 200 <= r.status_code < 300:
                    return
                if r.status_code >= 500 or r.status_code == 429:
                    raise httpx.HTTPStatusError(f"{r.status_code} {r.text}", request=r.request, response=r)
                return
        except Exception as e:
            last_err = e
            if attempt == RETRIES:
                break
            await asyncio.sleep(RETRY_BACKOFF * (2 ** attempt))
            attempt += 1
    _ = last_err

# ----------------- Публичные функции -----------------

async def send_json(payload: Dict[str, Any]):
    """Синхронная (async) отправка JSON-пакета на EXTERNAL_URL (если задан)."""
    if not EXTERNAL_URL:
        return
    await _post_json(EXTERNAL_URL, payload, headers=_auth_header(EXTERNAL_TOKEN))

async def fire_and_forget_json(payload: Dict[str, Any]):
    """Фоновая отправка JSON (не блокирует инференс)."""
    asyncio.create_task(send_json(payload))

async def send_violation(photo_bytes: bytes, fields: Dict[str, Any]):
    """
    Отправка ОДНОЙ записи нарушения на VIOLATIONS_URL как multipart/form-data.
    fields должен содержать:
      driver_id:int, car_id:int, passengers:int,
      violation_type_id:int, lat:float, lon:float, speed:int,
      confidence:float, location:str, time:str
    """
    if not VIOLATIONS_URL:
        return
    files = {"photo": ("frame.jpg", photo_bytes, "image/jpeg")}
    await _post_multipart(VIOLATIONS_URL, files=files, data=fields, headers=_auth_header(VIOLATIONS_TOKEN))

# (опц.) если где-то понадобиться fire-and-forget для violations:
async def fire_and_forget_violation(photo_bytes: bytes, fields: Dict[str, Any]):
    asyncio.create_task(send_violation(photo_bytes, fields))
