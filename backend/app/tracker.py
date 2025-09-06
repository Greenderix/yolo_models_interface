# Простенький IoU-трекер по классам: сопоставляет боксы с прошлого кадра по IoU
from dataclasses import dataclass, field
from typing import List, Dict, Tuple
import math

def iou(a, b):
    ax1, ay1, aw, ah = a
    bx1, by1, bw, bh = b
    ax2, ay2 = ax1 + aw, ay1 + ah
    bx2, by2 = bx1 + bw, by1 + bh
    inter_w = max(0, min(ax2, bx2) - max(ax1, bx1))
    inter_h = max(0, min(ay2, by2) - max(ay1, by1))
    inter = inter_w * inter_h
    if inter == 0:
        return 0.0
    area_a = aw * ah
    area_b = bw * bh
    return inter / (area_a + area_b - inter)

@dataclass
class Track:
    id: int
    box: Tuple[float,float,float,float]  # x,y,w,h
    cls_id: int
    last_ts: int

@dataclass
class SimpleTracker:
    next_id: int = 1
    # по классам ведём отдельные списки треков
    tracks_by_cls: Dict[int, List[Track]] = field(default_factory=dict)
    # запоминаем, что на треке был «ремень пристёгнут» в последние K кадров
    seatbelt_seen_ts: Dict[int, int] = field(default_factory=dict)

    def update(self, detections, ts_ms: int, iou_thresh: float = 0.5):
        """
        detections: список dict {x,y,w,h, cls_id, cls, score}
        Возвращает: тот же список c добавленным полем track_id
        """
        # группируем детекции по классу
        by_cls: Dict[int, List[dict]] = {}
        for d in detections:
            by_cls.setdefault(d["cls_id"], []).append(d)

        for cls_id, dets in by_cls.items():
            cur_tracks = self.tracks_by_cls.get(cls_id, [])
            used = set()
            # сопоставление по IoU
            for d in dets:
                box = (d["x"], d["y"], d["w"], d["h"])
                best_iou, best_idx = 0.0, -1
                for idx, tr in enumerate(cur_tracks):
                    if idx in used:
                        continue
                    ii = iou(box, tr.box)
                    if ii > best_iou:
                        best_iou, best_idx = ii, idx
                if best_iou >= iou_thresh and best_idx >= 0:
                    tr = cur_tracks[best_idx]
                    tr.box = box
                    tr.last_ts = ts_ms
                    used.add(best_idx)
                    d["track_id"] = tr.id
                else:
                    tr_id = self.next_id
                    self.next_id += 1
                    tr = Track(id=tr_id, box=box, cls_id=cls_id, last_ts=ts_ms)
                    cur_tracks.append(tr)
                    d["track_id"] = tr_id
            # чистим старые (не видели >5 сек)
            self.tracks_by_cls[cls_id] = [
                t for t in cur_tracks if ts_ms - t.last_ts <= 5000
            ]

        return detections
