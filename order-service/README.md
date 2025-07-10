# Order Service

A microservice for managing orders in the microservices architecture. This service handles order creation, updates, status management, and integrates with other services via RabbitMQ.

## Features

- **Order Management**: Create, read, update, and delete orders
- **Status Management**: Track order status with validation
- **User Isolation**: Orders are isolated per user
- **Event Publishing**: Publishes events to RabbitMQ for integration
- **JWT Authentication**: Validates tokens via auth-service
- **Swagger Documentation**: Auto-generated API documentation

## Order Status Flow

```
PENDING → PROCESSING → CONFIRMED → SHIPPED → DELIVERED
    ↓         ↓           ↓
CANCELLED  CANCELLED   CANCELLED
    ↓
REFUNDED
```

## API Endpoints

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create a new order |
| GET | `/orders` | Get all orders for current user |
| GET | `/orders/status/:status` | Get orders by status |
| GET | `/orders/statistics` | Get order statistics |
| GET | `/orders/:id` | Get order by ID |
| PATCH | `/orders/:id` | Update order |
| PATCH | `/orders/:id/status` | Update order status |
| DELETE | `/orders/:id` | Delete order |

### Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB
- RabbitMQ
- Docker (optional)

### Environment Variables

Copy `env.example` to `.env` and configure:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://mongodb:27017/order-service

# RabbitMQ Configuration
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672

# Service Configuration
PORT=3000

# JWT Configuration (for token validation)
JWT_ACCESS_SECRET=your-jwt-access-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

### Installation

```bash
# Install dependencies
npm install

# Development
npm run start:dev

# Production
npm run build
npm start
```

### Docker

```bash
# Build and run with Docker Compose
docker-compose up order-service

# Or build individually
docker build -t order-service .
docker run -p 3002:3000 order-service
```

## API Examples

### Create Order

```bash
curl -X POST http://localhost:3002/orders \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productIds": ["product1", "product2"],
    "totalPrice": 150.00,
    "status": "pending"
  }'
```

### Get Orders by Status

```bash
curl -X GET http://localhost:3002/orders/status/pending \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Update Order Status

```bash
curl -X PATCH http://localhost:3002/orders/order-id/status \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "processing"
  }'
```

### Get Order Statistics

```bash
curl -X GET http://localhost:3002/orders/statistics \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Data Model

### Order Schema

```typescript
{
  productIds: string[],    // Array of product IDs
  userId: string,          // User who created the order
  status: string,          // Order status (pending, processing, etc.)
  totalPrice: number,      // Total order price
  createdAt: Date,         // Order creation timestamp
  updatedAt: Date          // Last update timestamp
}
```

### Order Status Values

- `pending`: Order created, awaiting processing
- `processing`: Order is being processed
- `confirmed`: Order confirmed, ready for shipping
- `shipped`: Order has been shipped
- `delivered`: Order has been delivered
- `cancelled`: Order has been cancelled
- `refunded`: Order has been refunded

## Integration

### RabbitMQ Events

The service publishes the following events:

- `order.created`: When a new order is created
- `order.updated`: When an order is updated
- `order.deleted`: When an order is deleted

### Event Payload Examples

```json
// order.created
{
  "orderId": "order123",
  "userId": "user123",
  "productIds": ["product1", "product2"],
  "totalPrice": 150.00
}

// order.updated
{
  "orderId": "order123",
  "userId": "user123",
  "status": "processing"
}

// order.deleted
{
  "orderId": "order123",
  "userId": "user123"
}
```

## Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Development

### Project Structure

```
src/
├── main.ts                 # Application entry point
├── app.module.ts          # Root module
└── modules/
    ├── orders/            # Orders module
    │   ├── orders.controller.ts
    │   ├── orders.service.ts
    │   ├── orders.module.ts
    │   ├── dto/
    │   │   ├── create-order.dto.ts
    │   │   └── update-order.dto.ts
    │   ├── schemas/
    │   │   └── order.schema.ts
    │   ├── seed/
    │   │   └── orders.seed.ts
    │   └── orders.service.spec.ts
    ├── rabbitmq/          # RabbitMQ module
    │   ├── rabbitmq.service.ts
    │   └── rabbitmq.module.ts
    └── auth/              # Authentication module
        └── guards/
            ├── jwt-auth.guard.ts
            └── jwt.strategy.ts
```

### Adding New Features

1. **New Endpoints**: Add to `orders.controller.ts`
2. **Business Logic**: Add to `orders.service.ts`
3. **Data Validation**: Update DTOs in `dto/` folder
4. **Database Changes**: Update schema in `schemas/order.schema.ts`
5. **Tests**: Add tests in `*.spec.ts` files

## Troubleshooting

### Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running and accessible
2. **RabbitMQ Connection**: Check RabbitMQ URL and credentials
3. **JWT Validation**: Verify JWT tokens are valid and auth-service is running
4. **Port Conflicts**: Ensure port 3002 is available

### Logs

Check logs for detailed error information:

```bash
# Docker logs
docker-compose logs order-service

# Application logs
npm run start:dev
```

## Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass

## License

This project is part of the microservices architecture. 