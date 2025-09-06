
from pydantic import BaseModel, Field
from typing import List, Optional

class Detection(BaseModel):
    x: float
    y: float
    w: float
    h: float
    score: float
    cls: str = Field(..., description="class name")
    cls_id: int
    track_id: Optional[int] = None

class InferRequest(BaseModel):
    sessionId: str
    modelId: str
    frameTsMs: int
    imageBase64: str  # data URL: data:image/jpeg;base64,...
    options: Optional[dict] = None

class InferResponse(BaseModel):
    modelId: str
    frameTsMs: int
    detections: List[Detection]
    meta: dict

class ModelInfo(BaseModel):
    id: str
    title: str
    description: str
