<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Sales API - Complete Sales Flow Documentation

## Overview

The Sales API manages the complete lifecycle of sales transactions in a multi-step process. Each sale goes through three main stages: creation, item management, and payment processing. The system maintains data integrity by taking snapshots of prices and commission rates at each stage.

## Sales Flow Architecture

### 1. Sale Creation (PENDING Status)

- Creates a sale record with initial PENDING status
- Captures seller commission percentage snapshot
- Sets total value to 0 (will be calculated when items are added)
- Associates with client and seller

### 2. Item Management

- Add/replace items in the sale
- Each item captures current product price as snapshot
- Recalculates total sale value
- Only allowed for PENDING sales

### 3. Payment Processing (PAID Status)

- Records payment method and date
- Calculates commission based on snapshot percentage
- Changes status from PENDING to PAID
- Locks the sale (no more modifications allowed)

## API Endpoints

### Authentication & Authorization

All endpoints require JWT authentication and appropriate role permissions:

- **ADMIN**: Can access all sales
- **SELLER**: Can only access their own sales

### 1. Create Sale

**POST** `/sales`

Creates a new sale with PENDING status.

**Request Body:**

```json
{
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "notes": "Venda para cliente VIP"
}
```

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2024-01-15T10:30:00.000Z",
  "notes": "Venda para cliente VIP",
  "totalValue": "0",
  "paymentStatus": "PENDING",
  "paymentMethod": null,
  "paymentDate": null,
  "commissionPercentSnapshot": "0.05",
  "commissionValue": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "sellerId": "seller-uuid-here",
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "seller": {
    "id": "seller-uuid-here",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "role": "SELLER"
  },
  "client": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Maria Santos",
    "cpf": "123.456.789-00"
  }
}
```

### 2. Add/Replace Items

**PATCH** `/sales/{saleId}/items`

Adds or replaces all items in a sale. This operation replaces existing items completely.

**Request Body:**

```json
{
  "items": [
    {
      "productId": "prod-uuid-1",
      "quantity": 2
    },
    {
      "productId": "prod-uuid-2",
      "quantity": 1
    }
  ]
}
```

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2024-01-15T10:30:00.000Z",
  "notes": "Venda para cliente VIP",
  "totalValue": "150.00",
  "paymentStatus": "PENDING",
  "paymentMethod": null,
  "paymentDate": null,
  "commissionPercentSnapshot": "0.05",
  "commissionValue": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:35:00.000Z",
  "sellerId": "seller-uuid-here",
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "seller": {
    "id": "seller-uuid-here",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "role": "SELLER"
  },
  "client": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Maria Santos",
    "cpf": "123.456.789-00"
  }
}
```

**Important Notes:**

- This operation completely replaces all existing items
- Each item captures the current product price as a snapshot
- Total value is automatically recalculated
- Only allowed for PENDING sales

### 3. Process Payment

**PATCH** `/sales/{saleId}/pay`

Finalizes the sale by recording payment and changing status to PAID.

**Request Body:**

```json
{
  "paymentMethod": "PIX",
  "paymentDate": "2024-01-15"
}
```

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2024-01-15T10:30:00.000Z",
  "notes": "Venda para cliente VIP",
  "totalValue": "150.00",
  "paymentStatus": "PAID",
  "paymentMethod": "PIX",
  "paymentDate": "2024-01-15T00:00:00.000Z",
  "commissionPercentSnapshot": "0.05",
  "commissionValue": "7.50",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:40:00.000Z",
  "sellerId": "seller-uuid-here",
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "seller": {
    "id": "seller-uuid-here",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "role": "SELLER"
  },
  "client": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Maria Santos",
    "cpf": "123.456.789-00"
  }
}
```

**Important Notes:**

- Commission is calculated based on the snapshot percentage
- Sale becomes locked (no more modifications allowed)
- Payment date is stored as a full DateTime

### 4. Get Sale Details

**GET** `/sales/{saleId}`

Retrieves complete sale information including all items.

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2024-01-15T10:30:00.000Z",
  "notes": "Venda para cliente VIP",
  "totalValue": "150.00",
  "paymentStatus": "PAID",
  "paymentMethod": "PIX",
  "paymentDate": "2024-01-15T00:00:00.000Z",
  "commissionPercentSnapshot": "0.05",
  "commissionValue": "7.50",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:40:00.000Z",
  "sellerId": "seller-uuid-here",
  "clientId": "550e8400-e29b-41d4-a716-446655440000",
  "seller": {
    "id": "seller-uuid-here",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "role": "SELLER"
  },
  "client": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Maria Santos",
    "cpf": "123.456.789-00"
  },
  "items": [
    {
      "id": "item-uuid-1",
      "productId": "prod-uuid-1",
      "quantity": 2,
      "unitPrice": "50.00",
      "subtotal": "100.00",
      "product": {
        "id": "prod-uuid-1",
        "name": "Produto A",
        "sku": "PROD001"
      }
    },
    {
      "id": "item-uuid-2",
      "productId": "prod-uuid-2",
      "quantity": 1,
      "unitPrice": "50.00",
      "subtotal": "50.00",
      "product": {
        "id": "prod-uuid-2",
        "name": "Produto B",
        "sku": "PROD002"
      }
    }
  ]
}
```

### 5. List Sales

**GET** `/sales`

Lists sales with filtering, pagination, and sorting options.

**Query Parameters:**

- `clientId` (UUID): Filter by specific client
- `paymentStatus` (PENDING|PAID|CANCELED): Filter by payment status
- `q` (string): Search by client name (contains)
- `start` (YYYY-MM-DD): Start date filter
- `end` (YYYY-MM-DD): End date filter
- `page` (number): Page number (default: 1)
- `perPage` (number): Items per page (default: 15, max: 100)
- `sortBy` (date|createdAt): Sort field (default: date)
- `order` (asc|desc): Sort order (default: desc)

**Example Request:**

```
GET /sales?paymentStatus=PENDING&page=1&perPage=10&sortBy=date&order=desc
```

**Response:**

```json
{
  "items": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "date": "2024-01-15T10:30:00.000Z",
      "notes": "Venda para cliente VIP",
      "totalValue": "150.00",
      "paymentStatus": "PENDING",
      "paymentMethod": null,
      "paymentDate": null,
      "commissionPercentSnapshot": "0.05",
      "commissionValue": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z",
      "sellerId": "seller-uuid-here",
      "clientId": "550e8400-e29b-41d4-a716-446655440000",
      "seller": {
        "id": "seller-uuid-here",
        "name": "João Silva",
        "email": "joao@empresa.com",
        "role": "SELLER"
      },
      "client": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Maria Santos",
        "cpf": "123.456.789-00"
      }
    }
  ],
  "page": 1,
  "perPage": 10,
  "total": 25,
  "totalPages": 3
}
```

### 6. Get Status Counts

**GET** `/sales/counts/status`

Returns accurate counts of sales by status without pagination.

**Query Parameters:** Same as list sales (except pagination params)

**Response:**

```json
{
  "total": 150,
  "paid": 120,
  "pending": 25,
  "canceled": 5
}
```

## Complete Sales Flow Example

### Step 1: Create Sale

```bash
curl -X POST http://localhost:3000/sales \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "550e8400-e29b-41d4-a716-446655440000",
    "notes": "Venda para cliente VIP"
  }'
```

**Result:** Sale created with ID `123e4567-e89b-12d3-a456-426614174000`, status PENDING, total $0.00

### Step 2: Add Items

```bash
curl -X PATCH http://localhost:3000/sales/123e4567-e89b-12d3-a456-426614174000/items \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "prod-uuid-1",
        "quantity": 2
      },
      {
        "productId": "prod-uuid-2",
        "quantity": 1
      }
    ]
  }'
```

**Result:** Items added, total updated to $150.00, prices snapshotted

### Step 3: Process Payment

```bash
curl -X PATCH http://localhost:3000/sales/123e4567-e89b-12d3-a456-426614174000/pay \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "PIX",
    "paymentDate": "2024-01-15"
  }'
```

**Result:** Sale marked as PAID, commission calculated ($7.50), sale locked

### Step 4: View Complete Sale

```bash
curl -X GET http://localhost:3000/sales/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Result:** Complete sale details with all items and payment information

## Data Models

### Sale Status Flow

```
PENDING → PAID (final state)
   ↓
CANCELED (optional)
```

### Payment Methods

- `PIX`: PIX transfer
- `CARTAO`: Credit/Debit card
- `DINHEIRO`: Cash
- `BOLETO`: Bank slip

### Commission Calculation

Commission is calculated at payment time using the snapshot percentage:

```
Commission = Total Value × Commission Percentage Snapshot
Example: $150.00 × 0.05 = $7.50
```

## Business Rules

1. **Item Modification**: Only allowed for PENDING sales
2. **Price Snapshots**: Product prices are captured when items are added
3. **Commission Snapshots**: Seller commission percentage is captured at sale creation
4. **Payment Lock**: Once paid, sales cannot be modified
5. **Permission Control**: Sellers can only access their own sales, admins can access all
6. **Data Integrity**: All monetary values use Decimal type for precision

## Error Handling

### Common Error Responses

**400 Bad Request:**

```json
{
  "statusCode": 400,
  "message": "Não é possível alterar itens de uma venda já paga",
  "error": "Bad Request"
}
```

**403 Forbidden:**

```json
{
  "statusCode": 403,
  "message": "Você não pode alterar itens desta venda",
  "error": "Forbidden"
}
```

**404 Not Found:**

```json
{
  "statusCode": 404,
  "message": "Venda não encontrada",
  "error": "Not Found"
}
```

## Security Considerations

1. **JWT Authentication**: All endpoints require valid JWT tokens
2. **Role-Based Access**: Different permissions for ADMIN vs SELLER roles
3. **Data Isolation**: Sellers can only access their own sales
4. **Input Validation**: All DTOs use class-validator for input sanitization
5. **UUID Validation**: All ID parameters are validated as UUIDs

## Performance Notes

1. **Pagination**: List endpoints support pagination to handle large datasets
2. **Indexing**: Database indexes on frequently queried fields (date, paymentStatus, sellerId)
3. **Selective Loading**: Uses Prisma select to load only necessary fields
4. **Transaction Safety**: Item replacement uses database transactions for consistency

## Testing

The API includes comprehensive testing with Jest and can be tested using:

- Unit tests for services
- E2E tests for complete API flows
- Integration tests for database operations

## Dependencies

- **NestJS**: Framework for building scalable server-side applications
- **Prisma**: Database ORM with type safety
- **SQLite**: Database (can be easily changed to PostgreSQL/MySQL)
- **JWT**: Authentication and authorization
- **Class Validator**: Input validation and sanitization
