from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True)
    password_hash = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

class Driver(Base):
    __tablename__ = "driver"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    is_active = Column(Boolean, default=True)

class Car(Base):
    __tablename__ = "car"
    id = Column(Integer, primary_key=True)
    number = Column(String)
    model = Column(String)
    is_active = Column(Boolean, default=True)
    current_lat = Column(Float)
    current_lon = Column(Float)
    current_speed = Column(Integer)

class ViolationType(Base):
    __tablename__ = "violationtype"
    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True)

class Violation(Base):
    __tablename__ = "violation"
    id = Column(Integer, primary_key=True)
    driver_id = Column(Integer, ForeignKey("driver.id"))
    car_id = Column(Integer, ForeignKey("car.id"))
    violation_type_id = Column(Integer, ForeignKey("violationtype.id"))
    confidence = Column(Float)
    time = Column(DateTime, default=datetime.utcnow)
    location = Column(String)
    lat = Column(Float)
    lon = Column(Float)
    passengers = Column(Integer)
    speed = Column(Integer)
    photo_url = Column(String)

class CarAssignmentHistory(Base):
    __tablename__ = "carassignmenthistory"
    id = Column(Integer, primary_key=True)
    driver_id = Column(Integer, ForeignKey("driver.id"))
    car_id = Column(Integer, ForeignKey("car.id"))
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
