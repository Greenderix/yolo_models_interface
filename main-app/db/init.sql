-- Enable UUIDs (optional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE ViolationType (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  label VARCHAR(100),
  icon VARCHAR(10)
);

CREATE TABLE Driver (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE Car (
  id SERIAL PRIMARY KEY,
  number VARCHAR(20),
  model VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  lat FLOAT,
  lon FLOAT,
  speed INTEGER,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE DriverCarAssignment (
  id SERIAL PRIMARY KEY,
  driver_id INT REFERENCES Driver(id),
  car_id INT REFERENCES Car(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE Violation (
  id SERIAL PRIMARY KEY,
  driver_id INT REFERENCES Driver(id),
  car_id INT REFERENCES Car(id),
  violation_type_id INT REFERENCES ViolationType(id),
  confidence FLOAT,
  time TIMESTAMP NOT NULL,
  location VARCHAR(200),
  lat FLOAT,
  lon FLOAT,
  speed INT,
  photo_url VARCHAR(255)
);
ALTER TABLE violation ADD COLUMN passengers INTEGER;
UPDATE violation SET passengers = FLOOR(RANDOM() * 2 + 1) WHERE passengers IS NULL;
