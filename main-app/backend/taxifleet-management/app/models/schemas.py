from pydantic import BaseModel
from typing import Optional, List, Union
from datetime import datetime



class ViolationOut(BaseModel):
    id: int
    driver_id: int
    driver: str
    car: str
    violation_type_id: int
    violation: Optional[str]
    confidence: Optional[float]
    time: datetime
    location: str
    lat: float
    lon: float
    speed: int
    passengers: int
    photo_url: Optional[str]

    class Config:
        orm_mode = True


class ViolationDetailResponse(BaseModel):
    mainViolation: ViolationOut
    relatedViolations: List[ViolationOut]
