from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.s3 import upload_photo_to_s3
from app.services.db import save_violation
from uuid import uuid4
from datetime import datetime

router = APIRouter()

@router.post("/")
async def upload_violation(
    photo: UploadFile = File(...),
    driver_id: int = Form(...),
    car_id: int = Form(...),
    passengers: int = Form(...),
    violation_type_id: int = Form(...),
    lat: float = Form(...),
    lon: float = Form(...),
    speed: int = Form(...),
    confidence: float = Form(...),
    location: str = Form(...),
    time: str = Form(None)  # optional
):
    try:
        time_dt = datetime.fromisoformat(time) if time else datetime.utcnow()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid time format. Use ISO 8601.")

    filename = f"{uuid4()}.jpg"
    content = await photo.read()
    url = upload_photo_to_s3(filename, content)

    violation_id = await save_violation(
        driver_id=driver_id,
        car_id=car_id,
        violation_type_id=violation_type_id,
        passengers=passengers,
        lat=lat,
        lon=lon,
        speed=speed,
        confidence=confidence,
        location=location,
        photo_url=url,
        time=time_dt
    )

    return {
        "status": "ok",
        "violation_id": violation_id,
        "photo_url": url
    }
