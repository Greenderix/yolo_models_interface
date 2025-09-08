from fastapi import FastAPI
from app.api import violations
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Violations API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # или конкретный origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(violations.router, prefix="/violations")
