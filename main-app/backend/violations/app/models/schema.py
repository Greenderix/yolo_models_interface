from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class Car(Base):
    __tablename__ = "car"
    id = Column(Integer, primary_key=True)

class Driver(Base):
    __tablename__ = "driver"
    id = Column(Integer, primary_key=True)

class ViolationType(Base):
    __tablename__ = "violationtype"
    id = Column(Integer, primary_key=True)

class Violation(Base):
    __tablename__ = "violation"

    id = Column(Integer, primary_key=True, index=True)
    driver_id = Column(Integer, ForeignKey("driver.id"))
    car_id = Column(Integer, ForeignKey("car.id"))
    violation_type_id = Column(Integer, ForeignKey("violationtype.id"))
    confidence = Column(Float)
    time = Column(DateTime, default=datetime.utcnow)
    location = Column(String)
    lat = Column(Float)
    lon = Column(Float)
    speed = Column(Integer)
    passengers = Column(Integer)
    photo_url = Column(String)
