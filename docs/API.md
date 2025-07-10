# API Documentation

## Base URL
```
https://your-domain.com/api
```

## Authentication
All API endpoints require authentication using Laravel Sanctum tokens.

### Headers
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

## Response Format
All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

## Endpoints

### Authentication

#### Login
```http
POST /login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "roles": ["cashier"]
    },
    "token": "1|abc123..."
  }
}
```

#### Logout
```http
POST /logout
```

### Transactions

#### List Transactions
```http
GET /transactions
```

**Query Parameters:**
- `page` (int): Page number for pagination
- `per_page` (int): Items per page (default: 15)
- `status` (string): Filter by status (pending, completed, cancelled)
- `currency_id` (int): Filter by currency
- `date_from` (date): Start date filter
- `date_to` (date): End date filter

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "customer_name": "Ahmed Ali",
        "customer_phone": "+1234567890",
        "type": "buy",
        "from_currency": {
          "id": 1,
          "name": "USD",
          "symbol": "$"
        },
        "to_currency": {
          "id": 2,
          "name": "EGP",
          "symbol": "£"
        },
        "from_amount": 100.00,
        "to_amount": 3100.00,
        "exchange_rate": 31.00,
        "status": "completed",
        "created_by": {
          "id": 1,
          "name": "Cashier Name"
        },
        "assigned_to": {
          "id": 1,
          "name": "Cashier Name"
        },
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "meta": {
      "current_page": 1,
      "last_page": 5,
      "per_page": 15,
      "total": 75
    }
  }
}
```

#### Create Transaction
```http
POST /transactions
```

**Request Body:**
```json
{
  "customer_name": "Ahmed Ali",
  "customer_phone": "+1234567890",
  "type": "buy",
  "from_currency_id": 1,
  "to_currency_id": 2,
  "from_amount": 100.00,
  "exchange_rate": 31.00
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_name": "Ahmed Ali",
    "customer_phone": "+1234567890",
    "type": "buy",
    "from_currency": {
      "id": 1,
      "name": "USD",
      "symbol": "$"
    },
    "to_currency": {
      "id": 2,
      "name": "EGP",
      "symbol": "£"
    },
    "from_amount": 100.00,
    "to_amount": 3100.00,
    "exchange_rate": 31.00,
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Update Transaction Status
```http
PUT /transactions/{id}/status
```

**Request Body:**
```json
{
  "status": "completed"
}
```

#### Calculate Transaction
```http
POST /transactions/calculate
```

**Request Body:**
```json
{
  "from_currency_id": 1,
  "to_currency_id": 2,
  "from_amount": 100.00,
  "type": "buy"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "from_amount": 100.00,
    "to_amount": 3100.00,
    "exchange_rate": 31.00,
    "fee": 0.00
  }
}
```

### Cash Sessions

#### List Cash Sessions
```http
GET /cash-sessions
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user": {
        "id": 1,
        "name": "Cashier Name"
      },
      "status": "open",
      "opened_at": "2024-01-15T08:00:00Z",
      "closed_at": null,
      "initial_balances": [
        {
          "currency": {
            "id": 1,
            "name": "USD",
            "symbol": "$"
          },
          "amount": 1000.00
        }
      ],
      "current_balances": [
        {
          "currency": {
            "id": 1,
            "name": "USD",
            "symbol": "$"
          },
          "amount": 900.00
        }
      ]
    }
  ]
}
```

#### Open Cash Session
```http
POST /cash-sessions
```

**Request Body:**
```json
{
  "initial_balances": [
    {
      "currency_id": 1,
      "amount": 1000.00
    },
    {
      "currency_id": 2,
      "amount": 50000.00
    }
  ]
}
```

#### Close Cash Session
```http
PUT /cash-sessions/{id}/close
```

**Request Body:**
```json
{
  "final_balances": [
    {
      "currency_id": 1,
      "amount": 900.00
    },
    {
      "currency_id": 2,
      "amount": 53100.00
    }
  ],
  "notes": "Session closed successfully"
}
```

### Currencies

#### List Currencies
```http
GET /currencies
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "US Dollar",
      "code": "USD",
      "symbol": "$",
      "buy_rate": 31.00,
      "sell_rate": 31.50,
      "is_active": true,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Create Currency
```http
POST /currencies
```

**Request Body:**
```json
{
  "name": "US Dollar",
  "code": "USD",
  "symbol": "$",
  "buy_rate": 31.00,
  "sell_rate": 31.50,
  "is_active": true
}
```

#### Update Currency
```http
PUT /currencies/{id}
```

**Request Body:**
```json
{
  "name": "US Dollar",
  "code": "USD",
  "symbol": "$",
  "buy_rate": 31.20,
  "sell_rate": 31.70,
  "is_active": true
}
```

#### Delete Currency
```http
DELETE /currencies/{id}
```

### Cash Balances

#### Get Current Balances
```http
GET /cash-balances
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "currency": {
        "id": 1,
        "name": "USD",
        "symbol": "$"
      },
      "amount": 1000.00,
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Dashboard

#### Get Dashboard Statistics
```http
GET /dashboard/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "today_transactions": 25,
    "today_volume": 75000.00,
    "pending_transactions": 5,
    "active_sessions": 3,
    "recent_transactions": [...],
    "currency_balances": [...]
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid request format |
| 401  | Unauthorized - Invalid or missing token |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource not found |
| 422  | Validation Error - Invalid input data |
| 500  | Internal Server Error - Server error |

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 60 requests per minute
- **Transaction endpoints**: 30 requests per minute

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15, max: 100)

## Filtering and Sorting

Most list endpoints support filtering and sorting:
- **Filtering**: Use query parameters like `status=completed`
- **Sorting**: Use `sort=field` and `direction=asc|desc`
- **Search**: Use `search=term` for text search

## Webhooks

The system supports webhooks for real-time updates:

### Transaction Events
- `transaction.created`
- `transaction.updated`
- `transaction.completed`
- `transaction.cancelled`

### Cash Session Events
- `cash_session.opened`
- `cash_session.closed`

### Webhook Payload
```json
{
  "event": "transaction.completed",
  "data": {
    "transaction": {...}
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
``` 