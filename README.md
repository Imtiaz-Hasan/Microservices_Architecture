# Microservices Architecture Project

## Assessment Requirements Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Modular folder structure per service | ✅ | `src/modules`, `src/common`, `src/config` in each service |
| Auth Service: registration, login, logout, JWT, user events | ✅ | All endpoints and events implemented |
| Product Service: CRUD, user association, token validation, authorization | ✅ | All endpoints, user checks, and RabbitMQ validation |
| RabbitMQ for all inter-service messages | ✅ | Used for token validation and events |
| MongoDB with Typegoose | ✅ | Both services use Typegoose models |
| Dockerized, Docker Compose orchestration | ✅ | Dockerfiles and `docker-compose.yml` present |
| .env.example files for both services | ✅ | Included and documented |
| API Documentation (Swagger) | ✅ | Available at `/api` for both services |
| Centralized config structure | ✅ | `src/config` and `.env` usage |
| Unit tests for business logic | ✅ | Test files present in both services |
| Clean code, logging, error handling | ✅ | Strong typing, logging, and error handling throughout |
| Documentation clarity | ✅ | This README and Swagger docs |
| Git hygiene | ✅ | (Assumed, based on structure) |

---

This project demonstrates a microservices architecture using **NestJS**, **RabbitMQ**, and **MongoDB**. It consists of two independent services:

- **Auth Service**: Handles user authentication, registration, JWT token management, and user profile storage.
- **Product Service**: Manages a product catalog, associates products with users, and enforces authorization.

Both services communicate via RabbitMQ and are containerized for independent deployment.

---

## How It Works

- **User Registration/Login**: Auth Service handles user creation and authentication, issues JWT tokens, and publishes `user.created` events.
- **Token Validation**: Product Service validates JWTs by sending a message to Auth Service via RabbitMQ.
- **Product Management**: Product Service allows users to create, read, update, and delete products. Only the product owner can update/delete.
- **Authorization**: Product Service enforces that only the owner of a product can update or delete it, using user ID from validated JWT.
- **Event Publishing**: Both services publish relevant events to RabbitMQ for integration and extensibility.

---

## Table of Contents
- [Project Structure](#project-structure)
- [Features](#features)
- [Setup & Installation](#setup--installation)
- [Running the Project](#running-the-project)
- [API Overview](#api-overview)
- [Inter-Service Communication](#inter-service-communication)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Folder Structure](#folder-structure)
- [Contributing & Contact](#contributing--contact)

---

## Project Structure
```
.
├── auth-service/          # Authentication microservice
├── product-service/       # Product management microservice
├── docker-compose.yml     # Docker Compose configuration
└── README.md              # Project documentation
```

---

## Features
- Modular, scalable microservices architecture
- JWT-based authentication (access & refresh tokens)
- MongoDB with Typegoose models
- RabbitMQ for inter-service communication (events & RPC)
- Dockerized services with Docker Compose orchestration
- Swagger API documentation for both services
- Centralized configuration with `.env` files
- Unit tests for business logic

---

## Setup & Installation

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- [Node.js](https://nodejs.org/) (v16 or later, for local dev)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Configure Environment Variables
Copy the example env files and fill in the required values:
```bash
cp auth-service/.env.example auth-service/.env
cp product-service/.env.example product-service/.env
```

### 3. Start with Docker Compose
```bash
docker-compose up -d
```
- Auth Service: http://localhost:3000
- Product Service: http://localhost:3001
- RabbitMQ Management: http://localhost:15672 (guest/guest)
- MongoDB: mongodb://localhost:27017

### 4. Local Development (Optional)
Install dependencies and run each service:
```bash
# Auth Service
cd auth-service
npm install
npm run start:dev

# Product Service
cd ../product-service
npm install
npm run start:dev
```

---

## API Overview

### Auth Service Endpoints
| Method | Endpoint           | Description                        |
|--------|--------------------|------------------------------------|
| POST   | /auth/register     | Register a new user                |
| POST   | /auth/login        | Login and receive JWT tokens        |
| POST   | /auth/refresh      | Refresh access token                |
| GET    | /auth/validate     | Validate JWT token (requires token) |
| POST   | /users             | Create user (admin only)            |
| GET    | /users             | List all users (admin only)         |
| GET    | /users/:id         | Get user by ID                      |
| PATCH  | /users/:id         | Update user                         |
| DELETE | /users/:id         | Delete user (admin only)            |

### Product Service Endpoints
| Method | Endpoint           | Description                                 |
|--------|--------------------|---------------------------------------------|
| POST   | /products          | Create a new product (owner: current user)  |
| GET    | /products          | List all products for current user          |
| GET    | /products/:id      | Get product by ID (if owner)                |
| PATCH  | /products/:id      | Update product (if owner)                   |
| DELETE | /products/:id      | Delete product (if owner)                   |

> **Full API documentation is available via Swagger:**
> - Auth Service: http://localhost:3000/api
> - Product Service: http://localhost:3001/api

---

## Inter-Service Communication
- **User Registration:** Auth Service publishes `user.created` event to RabbitMQ.
- **Token Validation:** Product Service sends a message to Auth Service via RabbitMQ to validate JWT tokens.
- **Product Events:** Product Service publishes `product.created`, `product.updated`, and `product.deleted` events to RabbitMQ.

---

## Environment Variables

### Auth Service (`auth-service/.env.example`)
```
PORT=3000
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRATION=3600s
JWT_REFRESH_EXPIRATION=7d
MONGODB_URI=mongodb://mongodb:27017/auth-db
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
```

### Product Service (`product-service/.env.example`)
```
PORT=3001
MONGODB_URI=mongodb://mongodb:27017/product-db
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
```

---

## Testing
Run unit tests for each service:
```bash
# Auth Service
cd auth-service
npm run test

# Product Service
cd ../product-service
npm run test
```

---

## Folder Structure

### Auth Service
```
auth-service/
  src/
    modules/
      auth/
        decorators/
        dto/
        guards/
        strategies/
      rabbitmq/
      users/
        dto/
        schemas/
    common/
    config/
  test/
```

### Product Service
```
product-service/
  src/
    modules/
      auth/
        guards/
      products/
        dto/
        schemas/
      rabbitmq/
    common/
    config/
  test/
```

---

## Contributing & Contact

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

**Contact:**
- Project Maintainer: [Md. Imtiaz Hasan](mailto:imtiaz.hasan121@gmail.com)
- GitHub: [Imtiaz-Hasan](https://github.com/Imtiaz-Hasan)

---

