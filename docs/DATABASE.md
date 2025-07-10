# Database Documentation

## Overview
The Sibai Transactions system uses a relational database structure designed to handle multi-currency transactions, cash session management, and user authentication with role-based access control.

## Database Schema

### Core Tables

#### users
Stores user information and authentication data.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) | Primary key |
| name | varchar(255) | User full name |
| email | varchar(255) | Unique email address |
| email_verified_at | timestamp | Email verification timestamp |
| password | varchar(255) | Hashed password |
| two_factor_secret | text | 2FA secret key |
| two_factor_recovery_codes | text | 2FA recovery codes |
| two_factor_confirmed_at | timestamp | 2FA confirmation timestamp |
| remember_token | varchar(100) | Remember me token |
| current_team_id | bigint(20) | Current team ID |
| profile_photo_path | varchar(2048) | Profile photo path |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### currencies
Manages supported currencies and exchange rates.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) | Primary key |
| name | varchar(255) | Currency name |
| code | varchar(10) | Currency code (USD, EUR, etc.) |
| symbol | varchar(10) | Currency symbol ($, €, etc.) |
| buy_rate | decimal(10,4) | Buy exchange rate |
| sell_rate | decimal(10,4) | Sell exchange rate |
| is_active | boolean | Active status |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### customers
Stores customer information for transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) | Primary key |
| name | varchar(255) | Customer name |
| phone | varchar(20) | Customer phone number |
| email | varchar(255) | Customer email (nullable) |
| address | text | Customer address (nullable) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### cash_sessions
Manages daily cash sessions for cashiers.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) | Primary key |
| user_id | bigint(20) | Foreign key to users table |
| status | enum | Session status (open, closed, pending) |
| opened_at | timestamp | Session opening time |
| closed_at | timestamp | Session closing time (nullable) |
| notes | text | Session notes (nullable) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### transactions
Core transaction records.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) | Primary key |
| customer_id | bigint(20) | Foreign key to customers table |
| cash_session_id | bigint(20) | Foreign key to cash_sessions table |
| created_by | bigint(20) | Foreign key to users table |
| assigned_to | bigint(20) | Foreign key to users table |
| type | enum | Transaction type (buy, sell) |
| from_currency_id | bigint(20) | Source currency foreign key |
| to_currency_id | bigint(20) | Target currency foreign key |
| from_amount | decimal(15,4) | Source amount |
| to_amount | decimal(15,4) | Target amount |
| exchange_rate | decimal(10,4) | Applied exchange rate |
| status | enum | Transaction status (pending, completed, cancelled) |
| notes | text | Transaction notes (nullable) |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### cash_balances
Current cash balances per currency per session.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) | Primary key |
| cash_session_id | bigint(20) | Foreign key to cash_sessions table |
| currency_id | bigint(20) | Foreign key to currencies table |
| amount | decimal(15,4) | Current balance amount |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### cash_movements
Tracks all cash movements within sessions.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) | Primary key |
| cash_session_id | bigint(20) | Foreign key to cash_sessions table |
| currency_id | bigint(20) | Foreign key to currencies table |
| transaction_id | bigint(20) | Foreign key to transactions table (nullable) |
| type | enum | Movement type (initial, transaction, adjustment, final) |
| amount | decimal(15,4) | Movement amount |
| balance_before | decimal(15,4) | Balance before movement |
| balance_after | decimal(15,4) | Balance after movement |
| description | text | Movement description |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

### Authentication & Authorization Tables

#### personal_access_tokens
Laravel Sanctum tokens for API authentication.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) | Primary key |
| tokenable_type | varchar(255) | Tokenable model type |
| tokenable_id | bigint(20) | Tokenable model ID |
| name | varchar(255) | Token name |
| token | varchar(64) | Hashed token |
| abilities | text | Token abilities |
| last_used_at | timestamp | Last usage timestamp |
| expires_at | timestamp | Expiration timestamp |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### laratrust_roles
User roles for authorization.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) | Primary key |
| name | varchar(255) | Role name |
| display_name | varchar(255) | Human-readable role name |
| description | varchar(255) | Role description |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### laratrust_permissions
System permissions.

| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) | Primary key |
| name | varchar(255) | Permission name |
| display_name | varchar(255) | Human-readable permission name |
| description | varchar(255) | Permission description |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Last update timestamp |

#### laratrust_role_user
Many-to-many relationship between users and roles.

| Column | Type | Description |
|--------|------|-------------|
| role_id | bigint(20) | Foreign key to laratrust_roles |
| user_id | bigint(20) | Foreign key to users |
| user_type | varchar(255) | User model type |

#### laratrust_permission_role
Many-to-many relationship between roles and permissions.

| Column | Type | Description |
|--------|------|-------------|
| permission_id | bigint(20) | Foreign key to laratrust_permissions |
| role_id | bigint(20) | Foreign key to laratrust_roles |

## Relationships

### User Relationships
- `User` hasMany `CashSession`
- `User` hasMany `Transaction` (as creator)
- `User` hasMany `Transaction` (as assignee)
- `User` belongsToMany `Role`

### Transaction Relationships
- `Transaction` belongsTo `Customer`
- `Transaction` belongsTo `CashSession`
- `Transaction` belongsTo `User` (created_by)
- `Transaction` belongsTo `User` (assigned_to)
- `Transaction` belongsTo `Currency` (from_currency)
- `Transaction` belongsTo `Currency` (to_currency)
- `Transaction` hasMany `CashMovement`

### Cash Session Relationships
- `CashSession` belongsTo `User`
- `CashSession` hasMany `Transaction`
- `CashSession` hasMany `CashBalance`
- `CashSession` hasMany `CashMovement`

### Currency Relationships
- `Currency` hasMany `Transaction` (as from_currency)
- `Currency` hasMany `Transaction` (as to_currency)
- `Currency` hasMany `CashBalance`
- `Currency` hasMany `CashMovement`

## Indexes

### Primary Indexes
- All tables have primary key indexes on `id` column

### Foreign Key Indexes
- `transactions.customer_id`
- `transactions.cash_session_id`
- `transactions.created_by`
- `transactions.assigned_to`
- `transactions.from_currency_id`
- `transactions.to_currency_id`
- `cash_sessions.user_id`
- `cash_balances.cash_session_id`
- `cash_balances.currency_id`
- `cash_movements.cash_session_id`
- `cash_movements.currency_id`
- `cash_movements.transaction_id`

### Performance Indexes
- `transactions.status` - For filtering by transaction status
- `transactions.created_at` - For date-based queries
- `cash_sessions.status` - For filtering by session status
- `currencies.is_active` - For active currency filtering
- `users.email` - Unique index for authentication

## Constraints

### Foreign Key Constraints
- `transactions.customer_id` → `customers.id`
- `transactions.cash_session_id` → `cash_sessions.id`
- `transactions.created_by` → `users.id`
- `transactions.assigned_to` → `users.id`
- `transactions.from_currency_id` → `currencies.id`
- `transactions.to_currency_id` → `currencies.id`
- `cash_sessions.user_id` → `users.id`
- `cash_balances.cash_session_id` → `cash_sessions.id`
- `cash_balances.currency_id` → `currencies.id`
- `cash_movements.cash_session_id` → `cash_sessions.id`
- `cash_movements.currency_id` → `currencies.id`

### Unique Constraints
- `users.email` - Unique email addresses
- `currencies.code` - Unique currency codes
- `cash_balances(cash_session_id, currency_id)` - One balance per currency per session

### Check Constraints
- `transactions.from_amount > 0` - Positive amounts only
- `transactions.to_amount > 0` - Positive amounts only
- `transactions.exchange_rate > 0` - Positive exchange rates only
- `currencies.buy_rate > 0` - Positive buy rates only
- `currencies.sell_rate > 0` - Positive sell rates only

## Enums

### Transaction Status
- `pending` - Transaction created but not processed
- `completed` - Transaction successfully processed
- `cancelled` - Transaction cancelled

### Transaction Type
- `buy` - System buys currency from customer
- `sell` - System sells currency to customer

### Cash Session Status
- `open` - Active session
- `closed` - Completed session
- `pending` - Session pending approval

### Cash Movement Type
- `initial` - Initial balance when opening session
- `transaction` - Movement from transaction
- `adjustment` - Manual adjustment
- `final` - Final balance when closing session

## Migrations

The database is built using Laravel migrations located in `database/migrations/`:

1. `create_users_table.php` - User authentication
2. `create_customers_table.php` - Customer management
3. `create_currencies_table.php` - Currency setup
4. `create_cash_sessions_table.php` - Cash session management
5. `create_transactions_table.php` - Transaction processing
6. `create_cash_movements_table.php` - Cash movement tracking
7. `create_cash_balances_table.php` - Balance management
8. `laratrust_setup_tables.php` - Role and permission system

## Seeders

Database seeders populate initial data:

- `UserSeeder` - Creates admin and test users
- `CurrencySeeder` - Sets up common currencies
- `RolePermissionSeeder` - Creates roles and permissions
- `LaratrustSeeder` - Sets up role-permission relationships
- `SessionAndBalanceSeeder` - Creates sample sessions and balances

## Backup Strategy

### Daily Backups
- Full database backup at midnight
- Transaction log backup every 4 hours
- Retention period: 30 days

### Weekly Backups
- Full database backup on Sundays
- Retention period: 12 weeks

### Monthly Backups
- Full database backup on first day of month
- Retention period: 12 months

### Backup Commands
```bash
# Create backup
php artisan backup:run

# Restore from backup
php artisan backup:restore backup-file.sql

# Clean old backups
php artisan backup:clean
```

## Performance Optimization

### Query Optimization
- Use eager loading for relationships
- Implement query caching for frequently accessed data
- Use database indexes for common query patterns

### Connection Pooling
- Configure connection pooling for high-traffic scenarios
- Use read replicas for reporting queries

### Monitoring
- Monitor slow queries
- Track database performance metrics
- Set up alerts for performance degradation 