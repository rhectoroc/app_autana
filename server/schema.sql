CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  type VARCHAR(50) CHECK (type IN ('rent_short', 'rent_long', 'sale')),
  bathrooms DECIMAL(3, 1),
  bedrooms INTEGER,
  area_sqm DECIMAL(10, 2),
  parking_spots INTEGER,
  location VARCHAR(255),
  features JSONB DEFAULT '[]',
  video_url VARCHAR(255),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'rented')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS images (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  image_url VARCHAR(255) NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
