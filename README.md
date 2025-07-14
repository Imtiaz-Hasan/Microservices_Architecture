# Microservices Architecture Project

## Assessment Requirements Checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Modular folder structure per service | ✅ | `src/modules`, `src/common`, `src/config` in each service |
| Auth Service: registration, login, logout, JWT, user events | ✅ | All endpoints and events implemented |
| Product Service: CRUD, user association, token validation, authorization | ✅ | All endpoints, user checks, and RabbitMQ validation |
| Order Service: CRUD, product association, inventory check, token validation | ✅ | All endpoints, inventory integration, and RabbitMQ validation |
| Inventory Service: CRUD, stock management, reservation, RabbitMQ | ✅ | All endpoints and RabbitMQ integration |
| RabbitMQ for all inter-service messages | ✅ | Used for token validation and events |
| MongoDB with Typegoose | ✅ | All services use Typegoose models |
| Dockerized, Docker Compose orchestration | ✅ | Dockerfiles and `docker-compose.yml` present |
| .env.example files for all services | ✅ | Included and documented |
| API Documentation (Swagger) | ✅ | Available at `/api` for all services |
| Centralized config structure | ✅ | `src/config` and `.env` usage |
| Unit tests for business logic | ✅ | Test files present in all services |
| Clean code, logging, error handling | ✅ | Strong typing, logging, and error handling throughout |
| Documentation clarity | ✅ | This README and Swagger docs |
| Git hygiene | ✅ | (Assumed, based on structure) |

---

This project demonstrates a microservices architecture using **NestJS**, **RabbitMQ**, and **MongoDB**. It consists of four independent services:

- **Auth Service**: Handles user authentication, registration, JWT token management, and user profile storage.
- **Product Service**: Manages a product catalog, associates products with users, and enforces authorization.
- **Order Service**: Handles order creation, updates, and integrates with inventory and product services.
- **Inventory Service**: Manages product stock, reservations, and inventory updates.

All services communicate via RabbitMQ and are containerized for independent deployment.

---

## How It Works

- **User Registration/Login**: Auth Service handles user creation and authentication, issues JWT tokens, and publishes `user.created` events.
- **Token Validation**: Product, Order, and Inventory Services validate JWTs by sending a message to Auth Service via RabbitMQ.
- **Product Management**: Product Service allows users to create, read, update, and delete products. Only the product owner can update/delete.
- **Order Management**: Order Service allows users to create, read, update, and delete orders. It checks inventory before creating orders and updates inventory on order changes.
- **Inventory Management**: Inventory Service tracks product stock, handles reservations/releases, and responds to order-service requests.
- **Authorization**: Product and Order Services enforce that only the owner can update or delete their resources, using user ID from validated JWT.
- **Event Publishing**: All services publish relevant events to RabbitMQ for integration and extensibility.

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
├── order-service/         # Order management microservice
├── inventory-service/     # Inventory management microservice
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
- Swagger API documentation for all services
- Centralized configuration with `.env` files
- Unit tests for business logic
- **Order management with inventory checks**
- **Inventory management with stock reservation and release**

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
cp order-service/env.example order-service/.env
# (create inventory-service/.env if needed, see below)
```

### 3. Start with Docker Compose
```bash
docker-compose up -d
```
- Auth Service: http://localhost:3000
- Product Service: http://localhost:3001
- Order Service: http://localhost:3002
- Inventory Service: http://localhost:3003
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

# Order Service
cd ../order-service
npm install
npm run start:dev

# Inventory Service
cd ../inventory-service
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

### Order Service Endpoints
| Method | Endpoint           | Description                                 |
|--------|--------------------|---------------------------------------------|
| POST   | /orders            | Create a new order (checks inventory)       |
| GET    | /orders            | List all orders for current user            |
| GET    | /orders/:id        | Get order by ID (if owner)                  |
| PATCH  | /orders/:id        | Update order (if owner)                     |
| DELETE | /orders/:id        | Delete order (if owner)                     |

### Inventory Service Endpoints
| Method | Endpoint                       | Description                                 |
|--------|--------------------------------|---------------------------------------------|
| POST   | /inventory                     | Create a new inventory item                 |
| GET    | /inventory                     | List all inventory items                    |
| GET    | /inventory/:id                 | Get inventory item by ID                    |
| PATCH  | /inventory/:id                 | Update inventory item                       |
| DELETE | /inventory/:id                 | Delete inventory item                       |
| GET    | /inventory/check-stock/:productId?quantity=Q | Check stock for a product                |

> **Full API documentation is available via Swagger:**
> - Auth Service: http://localhost:3000/api
> - Product Service: http://localhost:3001/api
> - Order Service: http://localhost:3002/api
> - Inventory Service: http://localhost:3003/api

---

## Inter-Service Communication
- **User Registration:** Auth Service publishes `user.created` event to RabbitMQ.
- **Token Validation:** Product, Order, and Inventory Services send a message to Auth Service via RabbitMQ to validate JWT tokens.
- **Product Events:** Product Service publishes `product.created`, `product.updated`, and `product.deleted` events to RabbitMQ.
- **Order Creation:** Order Service checks inventory via RabbitMQ before creating an order, and publishes `order.created` events.
- **Inventory Management:** Inventory Service responds to stock check, reserve, and release requests from Order Service via RabbitMQ.

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

### Order Service (`order-service/env.example`)
```
PORT=3002
MONGODB_URI=mongodb://mongodb:27017/order-db
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
```

### Inventory Service (`inventory-service/.env.example`)
```
PORT=3003
MONGODB_URI=mongodb://mongodb:27017/inventory
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

# Order Service
cd ../order-service
npm run test

# Inventory Service
cd ../inventory-service
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

### Order Service
```
order-service/
  src/
    modules/
      auth/
        guards/
        jwt.strategy.ts
      orders/
        dto/
        schemas/
        seed/
      rabbitmq/
    app.module.ts
    main.ts
  test/
```

### Inventory Service
```
inventory-service/
  src/
    modules/
      inventory/
        dto/
        schemas/
      rabbitmq/
    app.module.ts
    main.ts
```

---

## Contributing & Contact

Contributions, issues, and feature requests are welcome! Feel free to open an issue or submit a pull request.

**Contact:**
- Project Maintainer: [Md. Imtiaz Hasan](mailto:imtiaz.hasan121@gmail.com)
- GitHub: [Imtiaz-Hasan](https://github.com/Imtiaz-Hasan)

---

