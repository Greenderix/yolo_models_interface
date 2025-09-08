from fastapi import FastAPI

app = FastAPI(title="TaxiFleet Management API")


from app.api import violation
app.include_router(violation.router)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # или конкретный origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
