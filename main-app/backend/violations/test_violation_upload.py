import requests
from pathlib import Path
import random
import time

# === Настройки ===
API_URL = "http://localhost:8002/violations/"
PHOTO_DIR = Path(__file__).parent / "test_photos"

# === Тестовые значения ===
drivers = [1, 2, 3]
cars = [1, 2, 3]
violation_types = {
    1: "seatbelt.jpg",
    2: "smoking.jpg",
    3: "phone.jpg"
}

locations = [
    "Tverskaya St", "Lenina Ave", "Kutuzovsky Prospect", "Arbat St"
]

def generate_random_payload():
    vt_id = random.choice(list(violation_types.keys()))
    return {
        "driver_id": str(random.choice(drivers)),
        "car_id": str(random.choice(cars)),
        "violation_type_id": str(vt_id),
        "lat": str(round(55.75 + random.uniform(-0.02, 0.02), 6)),
        "lon": str(round(37.62 + random.uniform(-0.05, 0.05), 6)),
        "speed": str(random.randint(0, 120)),
        "confidence": str(round(random.uniform(80.0, 99.9), 2)),
        "location": random.choice(locations),
        "photo_path": PHOTO_DIR / violation_types[vt_id],
        "passengers": 2
    }

def upload_violation():
    data = generate_random_payload()
    with open(data["photo_path"], "rb") as f:
        files = {"photo": f}
        form = {k: v for k, v in data.items() if k != "photo_path"}
        response = requests.post(API_URL, data=form, files=files)
        print(f"Status: {response.status_code}")
        print(response.json())

if __name__ == "__main__":
    print("🚀 Uploading test violation...")
    upload_violation()
