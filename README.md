# Store Rating Platform

## Project Overview
A web application for store ratings with role-based access control (System Administrator, Normal User, Store Owner). Users can submit and manage ratings for registered stores, while administrators can manage users and stores.

## Tech Stack
### Frontend (Current Implementation)
- React with TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- State Management: Context API/Redux (TBD)

### Backend (Implementation Guidelines)
#### Recommended Stack
- **Framework**: Express.js
  - RESTful API architecture
  - Middleware for authentication and authorization
  - Route handlers for different user roles

- **Database**: PostgreSQL
  - Robust relational database for complex relationships
  - Strong data integrity and constraints
  - Support for advanced queries and filtering

#### Suggested Database Schema
```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address VARCHAR(400),
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stores Table
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(400),
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ratings Table
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    store_id INTEGER REFERENCES stores(id),
    user_id INTEGER REFERENCES users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, user_id)
);
```

#### API Endpoints Structure
```
/api
  /auth
    POST /login
    POST /register
    POST /change-password
  /users
    GET /
    POST /
    GET /:id
    PUT /:id
  /stores
    GET /
    POST /
    GET /:id
    PUT /:id
  /ratings
    GET /store/:storeId
    POST /store/:storeId
    PUT /store/:storeId
```

## Getting Started

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup (Future Implementation)
1. Create a new directory for backend:
   ```bash
   mkdir backend
   cd backend
   ```
2. Initialize a new Node.js project:
   ```bash
   npm init -y
   ```
3. Install necessary dependencies:
   ```bash
   npm install express pg typescript @types/node @types/express
   ```
4. Set up PostgreSQL database using the schema provided above
5. Configure environment variables for database connection and JWT secrets
6. Implement API endpoints following the structure above

## Security Considerations
- Implement JWT for authentication
- Hash passwords using bcrypt
- Use environment variables for sensitive data
- Implement rate limiting for API endpoints
- Add input validation and sanitization
- Set up CORS properly

## Testing Strategy
- Unit tests for components and utilities
- Integration tests for API endpoints
- E2E tests for critical user flows
- Test coverage reporting# rolixer-rating-app
# rolixer-rating-app
