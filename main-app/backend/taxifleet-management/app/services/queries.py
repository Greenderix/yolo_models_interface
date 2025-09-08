
from sqlalchemy.future import select
from sqlalchemy import or_, and_, String
from sqlalchemy.orm import aliased

from app.models.schema import Violation, Car, Driver, ViolationType
from app.models.schemas import ViolationOut, ViolationDetailResponse
from app.services.s3 import generate_presigned_url
from urllib.parse import urlparse
from typing import List, Optional
from datetime import datetime
import os

def extract_filename(photo_url: str) -> str:
    return os.path.basename(urlparse(photo_url).path)

async def get_filtered_violations(
    session,
    query: Optional[str] = None,
    violation: Optional[str] = "all",
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    min_speed: Optional[int] = None,
    max_speed: Optional[int] = None
) -> List[ViolationOut]:
    stmt = (
        select(
            Violation.id,
            Violation.driver_id,
            Driver.name.label("driver"),
            Violation.violation_type_id,
            Violation.confidence,
            Violation.time,
            Violation.location,
            Violation.lat,
            Violation.lon,
            Violation.speed,
            Violation.passengers,
            Violation.photo_url,
            Car.number,
            ViolationType.code
        )
        .join(Car, Car.id == Violation.car_id)
        .join(Driver, Driver.id == Violation.driver_id)
        .join(ViolationType, ViolationType.id == Violation.violation_type_id)
    )

    if query:
        like_query = f"%{query.lower()}%"
        stmt = stmt.where(
            or_(
                Violation.id.cast(String).ilike(like_query),
                Violation.driver_id.cast(String).ilike(like_query),
                Car.number.ilike(like_query)
            )
        )

    if violation and violation != "all":
        mapping = {"seatbelt": 0, "smoking": 1, "phone": 2}
        vtype = mapping.get(violation)
        if vtype is not None:
            stmt = stmt.where(Violation.violation_type_id == vtype)

    if start_time:
        stmt = stmt.where(Violation.time >= start_time)
    if end_time:
        stmt = stmt.where(Violation.time <= end_time)
    if min_speed:
        stmt = stmt.where(Violation.speed >= min_speed)
    if max_speed:
        stmt = stmt.where(Violation.speed <= max_speed)

    result = await session.execute(stmt)
    rows = result.all()

    return [
        ViolationOut(
            id=row.id,
            driver_id=row.driver_id,
            car=row.number,
            driver=row.driver,
            violation_type_id=row.violation_type_id,
            violation=row.code,
            confidence=row.confidence,
            time=row.time,
            location=row.location,
            lat=row.lat,
            lon=row.lon,
            speed=row.speed,
            passengers=row.passengers,
            photo_url=generate_presigned_url(extract_filename(row.photo_url)) if row.photo_url else None
        )
        for row in rows
    ]

from sqlalchemy import func, and_, select, literal_column, cast, String
from sqlalchemy.dialects.postgresql import JSONB
from fastapi import HTTPException
from datetime import timedelta


async def get_violation_by_id(session, violation_id: int) -> ViolationDetailResponse:
    # Получаем основное нарушение
    main_stmt = (
        select(
            Violation.id,
            Violation.driver_id,
            Driver.name.label("driver"),
            Violation.violation_type_id,
            Violation.confidence,
            Violation.time,
            Violation.location,
            Violation.lat,
            Violation.lon,
            Violation.speed,
            Violation.passengers,
            Violation.photo_url,
            Car.number,
            ViolationType.code
        )
        .join(Driver, Driver.id == Violation.driver_id)
        .join(Car, Car.id == Violation.car_id)
        .join(ViolationType, ViolationType.id == Violation.violation_type_id)
        .where(Violation.id == violation_id)
    )

    main_result = await session.execute(main_stmt)
    main_row = main_result.first()
    if not main_row:
        raise ValueError("Violation not found")

    main = ViolationOut(
        id=main_row.id,
        driver_id=main_row.driver_id,
        car=main_row.number,
        driver=main_row.driver,
        violation_type_id=main_row.violation_type_id,
        confidence=main_row.confidence,
        time=main_row.time,
        location=main_row.location,
        lat=main_row.lat,
        lon=main_row.lon,
        speed=main_row.speed,
        passengers=main_row.passengers,
        violation=main_row.code,
        photo_url=generate_presigned_url(extract_filename(main_row.photo_url)) if main_row.photo_url else None    )

    # Ищем другие нарушения того же водителя ±10 минут
    start_time = main.time - timedelta(minutes=10)
    end_time = main.time + timedelta(minutes=10)

    related_stmt = (
        select(
            Violation.id,
            Violation.driver_id,
            Driver.name.label("driver"),
            Violation.violation_type_id,
            Violation.confidence,
            Violation.time,
            Violation.location,
            Violation.lat,
            Violation.lon,
            Violation.speed,
            Violation.passengers,
            Violation.photo_url,
            ViolationType.code,
            Car.number
        )
        .join(Driver, Driver.id == Violation.driver_id)
        .join(Car, Car.id == Violation.car_id)
        .join(ViolationType, ViolationType.id == Violation.violation_type_id)
        .where(
            and_(
                Violation.driver_id == main.driver_id,
                Violation.id != main.id,
                Violation.time >= start_time,
                Violation.time <= end_time
            )
        )
    )

    related_result = await session.execute(related_stmt)
    related = [
        ViolationOut(
            id=row.id,
            driver_id=row.driver_id,
            car=row.number,
            driver=row.driver,
            violation_type_id=row.violation_type_id,
            violation=row.code,
            confidence=row.confidence,
            time=row.time,
            location=row.location,
            lat=row.lat,
            lon=row.lon,
            speed=row.speed,
            passengers=row.passengers,
            photo_url=generate_presigned_url(extract_filename(row.photo_url)) if row.photo_url else None        )
        for row in related_result.all()
    ]

    return ViolationDetailResponse(
        mainViolation=main,
        relatedViolations=related
    )