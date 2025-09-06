
import os
from typing import Dict
from ultralytics import YOLO
import torch

_FORCE_DEVICE = os.getenv("DEVICE")
if _FORCE_DEVICE:
    DEVICE = _FORCE_DEVICE
else:
    if torch.cuda.is_available():
        DEVICE = "cuda"
    elif torch.backends.mps.is_available():
        DEVICE = "mps"
    else:
        DEVICE = "cpu"

class ModelRegistry:
    def __init__(self):
        print("Initializing ModelRegistry")
        raw = os.getenv("MODELS")
        print(raw)
        print(type(raw))
        if raw:
            pairs = [p for p in (s.strip() for s in raw.split(";")) if p]
            mapping = {}
            for p in pairs:
                k, v = p.split("=", 1)
                mapping[k.strip()] = v.strip()
        else:
            print(f'os.getenv("YOLOV8N_PATH", "models/yolov8n.pt") - {os.getenv("YOLOV8N_PATH", "../models/yolov8n.pt")}')
            mapping = {
                "yolov8n": os.getenv("YOLOV8N_PATH", "../models/yolov8n.pt"),
            }
        self._paths: Dict[str, str] = mapping
        self._models: Dict[str, YOLO] = {}

    def list(self):
        return [
            {"id": k, "title": k, "description": self._paths[k]}
            for k in self._paths
        ]

    def get(self, model_id: str) -> YOLO:
        if model_id not in self._paths:
            raise KeyError(f"Unknown model: {model_id}")
        if model_id not in self._models:
            model = YOLO(self._paths[model_id])
            model.to(DEVICE)
            self._models[model_id] = model
        return self._models[model_id]

REGISTRY = ModelRegistry()
DEVICE = DEVICE
