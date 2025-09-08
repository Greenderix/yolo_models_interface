
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime
from app.models.schemas import ViolationOut, ViolationDetailResponse
from app.services.queries import get_filtered_violations, get_violation_by_id
from app.models.db import get_db

router = APIRouter(prefix="/violations", tags=["Violations"])

@router.get("/", response_model=List[ViolationOut])
async def list_violations(
    query: Optional[str] = None,
    violation: Optional[str] = "all",
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    min_speed: Optional[int] = None,
    max_speed: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    print("Type of db:", type(db))

    return await get_filtered_violations(
        db,
        query=query,
        violation=violation,
        start_time=start_time,
        end_time=end_time,
        min_speed=min_speed,
        max_speed=max_speed
    )

@router.get("/{violation_id}", response_model=ViolationDetailResponse)
async def get_violation(violation_id: int, db: AsyncSession = Depends(get_db)):
    result = await get_violation_by_id(db, violation_id)
    if not result:
        raise HTTPException(status_code=404, detail="Violation not found")
    return result
