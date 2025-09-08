
from datetime import timedelta
from sqlalchemy.future import select
from sqlalchemy import and_
from fastapi import HTTPException
from app.models.models import Violation, Car, Driver, ViolationType
from app.schemas.violation import ViolationFullDetail
from app.utils.s3 import generate_presigned_url, extract_filename

async def get_violation_by_id(session, violation_id: int) -> ViolationFullDetail:
    # Основное нарушение
    result = await session.execute(
        select(
            Violation,
            Car.license_plate,
            Driver.name.label("driver_name"),
            ViolationType.name.label("violation_name")
        )
        .join(Car, Car.id == Violation.car_id)
        .join(Driver, Driver.id == Violation.driver_id)
        .join(ViolationType, Violation.violation_type_id == ViolationType.id)
        .where(Violation.id == violation_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Violation not found")

    violation, license_plate, driver_name, violation_name = row
    violation_time = violation.time
    driver_id = violation.driver_id

    # Дополнительные нарушения по driver_id ±10 минут
    time_window_start = violation_time - timedelta(minutes=10)
    time_window_end = violation_time + timedelta(minutes=10)

    related_result = await session.execute(
        select(Violation.id, Violation.time, ViolationType.name.label("type"))
        .join(ViolationType, Violation.violation_type_id == ViolationType.id)
        .where(
            and_(
                Violation.driver_id == driver_id,
                Violation.id != violation_id,
                Violation.time >= time_window_start,
                Violation.time <= time_window_end
            )
        )
        .order_by(Violation.time)
    )
    related = related_result.all()

    return ViolationFullDetail(
        id=violation.id,
        driver=driver_name,
        carId=license_plate,
        location=violation.location,
        confidence=violation.confidence,
        passengers=violation.passengers,
        time=violation.time,
        violation=violation_name,
        photo_url=generate_presigned_url(extract_filename(violation.photo_url)) if violation.photo_url else None,
        coordinates={"lat": violation.lat, "lon": violation.lon},
        relatedViolations=[
            {
                "id": r.id,
                "time": r.time.strftime("%H:%M"),
                "type": r.type
            }
            for r in related
        ]
    )
