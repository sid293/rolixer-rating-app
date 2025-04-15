# Backend Implementation Guide

## Database Schema Design

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL CHECK (LENGTH(name) >= 20),
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400),
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'USER', 'STORE_OWNER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Stores Table
```sql
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    address VARCHAR(400),
    owner_id INTEGER NOT NULL REFERENCES users(id),
    average_rating DECIMAL(2,1) DEFAULT 0.0 CHECK (average_rating >= 0 AND average_rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Ratings Table
```sql
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    store_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    UNIQUE(user_id, store_id)
);
```

### Indexes
```sql
-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Stores table indexes
CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_stores_rating ON stores(average_rating);

-- Ratings table indexes
CREATE INDEX idx_ratings_user ON ratings(user_id);
CREATE INDEX idx_ratings_store ON ratings(store_id);
```

### Triggers
```sql
-- Trigger to update average_rating in stores table
CREATE OR REPLACE FUNCTION update_store_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE stores
    SET average_rating = (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM ratings
        WHERE store_id = NEW.store_id
    )
    WHERE id = NEW.store_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_store_rating
AFTER INSERT OR UPDATE OR DELETE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_store_average_rating();
```

## Schema Design Explanation

1. **Users Table**:
   - Stores user information with role-based access control
   - Enforces email uniqueness and password complexity
   - Name length validation (20-60 characters)
   - Address maximum length (400 characters)

2. **Stores Table**:
   - Links to store owner through owner_id
   - Maintains average rating
   - Cascading delete when owner is deleted

3. **Ratings Table**:
   - Enforces rating range (1-5)
   - Prevents duplicate ratings from same user for same store
   - Cascading delete when user or store is deleted

4. **Indexes**:
   - Optimized for common queries and filtering
   - Supports efficient searching and sorting

5. **Triggers**:
   - Automatically updates store average rating
   - Maintains data consistency

This schema design supports all required functionalities while maintaining data integrity and following PostgreSQL best practices.