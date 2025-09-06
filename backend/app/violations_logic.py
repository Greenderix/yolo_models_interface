import asyncio
import time
from dataclasses import dataclass, field
from typing import Dict, Any, List, Tuple, Optional

# ----- троттлинг по ключу нарушения (например, per sessionId + track_id + type)
@dataclass
class ViolationThrottler:
    min_interval_sec: float = 60.0
    last_sent: Dict[str, float] = field(default_factory=dict)

    def should_send(self, key: str) -> bool:
        now = time.time()
        t = self.last_sent.get(key, 0.0)
        if now - t >= self.min_interval_sec:
            self.last_sent[key] = now
            return True
        return False

# ----- пакетная отправка: складываем в очередь и флашим в фоне
@dataclass
class BatchQueue:
    flush_interval_sec: float = 2.0
    max_batch: int = 20
    queue: List[Tuple[bytes, Dict[str, Any]]] = field(default_factory=list)
    _event: asyncio.Event = field(default_factory=asyncio.Event)

    # функция отправки одной записи (внедрим извне)
    sender = None  # async def _(photo_bytes, fields): ...

    async def put(self, photo: bytes, fields: Dict[str, Any]):
        self.queue.append((photo, fields))
        if len(self.queue) >= self.max_batch:
            self._event.set()

    async def run(self):
        while True:
            try:
                # ждём либо интервал, либо переполнение
                try:
                    await asyncio.wait_for(self._event.wait(), timeout=self.flush_interval_sec)
                except asyncio.TimeoutError:
                    pass
                self._event.clear()
                if not self.queue:
                    continue
                items = self.queue[:self.max_batch]
                self.queue = self.queue[self.max_batch:]
                # последовательно отправляем (эндпоинт принимает по одному)
                for photo, fields in items:
                    try:
                        await self.sender(photo, fields)  # external_client.send_violation
                    except Exception:
                        pass
            except asyncio.CancelledError:
                break
            except Exception:
                pass

# ----- правила нарушений (минимальный набор, можно расширять)
@dataclass
class ViolationRules:
    # соответствие классов -> violation_type_id
    by_name: Dict[str, int]
    by_id: Dict[int, int]
    # имя класса, который означает «ремень пристёгнут» (наличие признака)
    seatbelt_present_names: List[str] = field(default_factory=lambda: ["seatbelt"])
    # окно, в течение которого считаем, что у трека ремень был (в мс)
    seatbelt_window_ms: int = 3000

    def compute(self, detections: List[dict], session_tracker, ts_ms: int) -> List[Tuple[Optional[int], int, float]]:
        """
        Возвращает список триплетов: (track_id, violation_type_id, confidence)
        - Для классов из by_name/by_id: нарушение = есть детекция (например 'smoking','phone')
        - Для ремня: нарушение = для трека не наблюдали seatbelt в недавнем окне
        """
        out = []
        seatbelt_tracks = set()

        # 1) Детекции по прямому правилу (курение, телефон и т.д.)
        for d in detections:
            vt = None
            if d["cls"] in self.by_name:
                vt = self.by_name[d["cls"]]
            elif d["cls_id"] in self.by_id:
                vt = self.by_id[d["cls_id"]]
            if vt is not None:
                out.append((d.get("track_id"), vt, float(d.get("score", 0.0))))

        # 2) Отметим треки, у которых замечен «seatbelt present»
        for d in detections:
            if d["cls"] in self.seatbelt_present_names:
                tid = d.get("track_id")
                if tid is not None:
                    session_tracker.seatbelt_seen_ts[tid] = ts_ms
                    seatbelt_tracks.add(tid)

        # 3) Для всех треков в трекере — если недавно ремня не видели → нарушение seatbelt
        SEATBELT_VIOLATION_ID = None
        # найдём id «ремня» в словаре (ожидаем, что by_name содержит 'seatbelt': <id нарушения>)
        for name, vid in self.by_name.items():
            if name.lower() == "seatbelt":
                SEATBELT_VIOLATION_ID = vid
                break

        if SEATBELT_VIOLATION_ID is not None:
            for cls_id, tracks in session_tracker.tracks_by_cls.items():
                for tr in tracks:
                    last_ok = session_tracker.seatbelt_seen_ts.get(tr.id, -10**12)
                    if ts_ms - last_ok > self.seatbelt_window_ms:
                        # ремень в окне не видели — триггерим нарушение
                        out.append((tr.id, SEATBELT_VIOLATION_ID, 0.0))

        return out
