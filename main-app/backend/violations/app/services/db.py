from sqlalchemy.exc import NoResultFound
from sqlalchemy.future import select
from app.models.db import SessionLocal
from app.models.schema import Violation
from datetime import datetime

async def save_violation(
    driver_id: int,
    car_id: int,
    violation_type_id: int,
    lat: float,
    lon: float,
    speed: int,
    confidence: float,
    location: str,
    passengers: int,
    photo_url: str,
    time: datetime
):
    async with SessionLocal() as session:
        # (опц.) можно добавить проверки, существуют ли driver, car, violation_type
        v = Violation(
            driver_id=driver_id,
            car_id=car_id,
            violation_type_id=violation_type_id,
            lat=lat,
            lon=lon,
            speed=speed,
            confidence=confidence,
            location=location,
            passengers=passengers,
            photo_url=photo_url,
            time=time,
        )
        session.add(v)
        await session.commit()
        await session.refresh(v)
        return v.id
