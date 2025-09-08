
import base64
import time
from typing import List, Tuple
import numpy as np
import cv2
from ultralytics import YOLO

from .models import Detection

def decode_data_url_to_bgr(data_url: str) -> np.ndarray:
    if "," in data_url:
        _, b64 = data_url.split(",", 1)
    else:
        b64 = data_url
    img_bytes = base64.b64decode(b64)
    arr = np.frombuffer(img_bytes, dtype=np.uint8)
    bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if bgr is None:
        raise ValueError("Failed to decode image")
    return bgr

def run_infer(model: YOLO, bgr: np.ndarray, conf: float = 0.25) -> Tuple[List[Detection], dict]:
    h, w = bgr.shape[:2]
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    t0 = time.time()
    results = model.predict(rgb, conf=conf, verbose=False)
    dt = (time.time() - t0) * 1000.0
    dets: List[Detection] = []
    if not results:
        return dets, {"inferMs": dt}

    names = model.names if hasattr(model, "names") else {}
    r0 = results[0]
    boxes = r0.boxes  # xyxy, conf, cls
    if boxes is None:
        return dets, {"inferMs": dt}

    for i in range(len(boxes)):
        xyxy = boxes.xyxy[i].tolist()  # [x1,y1,x2,y2]
        x1, y1, x2, y2 = xyxy
        w_box = x2 - x1
        h_box = y2 - y1
        score = float(boxes.conf[i].item())
        cls_id = int(boxes.cls[i].item())
        cls_name = names.get(cls_id, str(cls_id))
        dets.append(
            Detection(
                x=float(x1),
                y=float(y1),
                w=float(w_box),
                h=float(h_box),
                score=score,
                cls=cls_name,
                cls_id=cls_id,
            )
        )
    return dets, {"inferMs": dt, "imgW": w, "imgH": h}
