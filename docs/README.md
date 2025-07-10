# Sibai Transactions System

A comprehensive Laravel-based cash transaction management system with real-time currency exchange capabilities, built with Laravel 11, Inertia.js, and React TypeScript.

## 🚀 Features

### Core Functionality
- **Multi-Currency Support**: Handle transactions between different currencies
- **Real-time Exchange**: Live currency conversion and exchange rates
- **Cash Session Management**: Track opening/closing cash sessions with balance management
- **Transaction Processing**: Complete transaction lifecycle management
- **User Role Management**: Role-based access control with Laratrust
- **Dashboard Analytics**: Real-time statistics and transaction monitoring

### User Management
- **Authentication**: Laravel Fortify with 2FA support
- **Role-based Access**: Admin, Cashier, and User roles
- **Profile Management**: User profile and password management
- **Session Security**: Multi-device session management

### Financial Features
- **Cash Balance Tracking**: Real-time balance monitoring per currency
- **Transaction History**: Complete audit trail of all transactions
- **Pending Transactions**: Queue management for pending operations
- **Currency Management**: Add, edit, and manage supported currencies
- **Session Reconciliation**: End-of-day cash session closing

## 🏗️ Architecture

### Backend (Laravel 11)
- **Framework**: Laravel 11 with PHP 8.1+
- **Database**: MySQL/PostgreSQL support
- **Authentication**: Laravel Fortify + Sanctum
- **Authorization**: Laratrust for role/permission management
- **API**: RESTful API with Inertia.js integration

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Routing**: Inertia.js for SPA experience
- **Styling**: Tailwind CSS with custom components
- **State Management**: React hooks + Inertia state
- **UI Components**: Custom component library

### Key Components
- **Models**: User, Transaction, Currency, CashSession, CashBalance, CashMovement
- **Controllers**: Transaction, CashSession, Currency, Dashboard management
- **Services**: TransactionService, CashSessionService for business logic
- **Middleware**: Session validation, role-based access control
- **Policies**: Transaction authorization and access control

## 📋 Requirements

- PHP 8.1 or higher
- Composer
- Node.js 16+ and npm
- MySQL 8.0+ or PostgreSQL 13+
- Redis (optional, for caching)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sibai_transactions
```

### 2. Install PHP Dependencies
```bash
composer install
```

### 3. Install Node Dependencies
```bash
npm install
```

### 4. Environment Setup
```bash
cp .env.example .env
php artisan key:generate
```

### 5. Database Configuration
Update your `.env` file with database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sibai_transactions
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 6. Run Migrations and Seeders
```bash
php artisan migrate
php artisan db:seed
```

### 7. Build Frontend Assets
```bash
npm run build
# or for development
npm run dev
```

### 8. Start the Application
```bash
php artisan serve
```

## 🗂️ Project Structure

```
sibai_transactions/
├── app/
│   ├── Actions/           # Fortify actions
│   ├── Enums/            # System enumerations
│   ├── Http/
│   │   ├── Controllers/  # API controllers
│   │   ├── Middleware/   # Custom middleware
│   │   └── Requests/     # Form request validation
│   ├── Models/           # Eloquent models
│   ├── Policies/         # Authorization policies
│   ├── Rules/            # Custom validation rules
│   └── Services/         # Business logic services
├── database/
│   ├── migrations/       # Database migrations
│   └── seeders/          # Database seeders
├── resources/
│   ├── js/              # React TypeScript frontend
│   │   ├── Components/  # Reusable components
│   │   ├── Layouts/     # Page layouts
│   │   ├── Pages/       # Page components
│   │   └── types.ts     # TypeScript definitions
│   └── css/             # Stylesheets
└── routes/
    ├── web.php          # Web routes
    └── api.php          # API routes
```

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access, user management, system configuration
- **Cashier**: Transaction processing, cash session management
- **User**: Limited access, view-only permissions

### Permissions
- `transactions-create`: Create new transactions
- `transactions-update`: Modify existing transactions
- `transactions-delete`: Delete transactions
- `cash-sessions-manage`: Manage cash sessions
- `currencies-manage`: Manage currency settings
- `users-manage`: User administration

## 🔄 Cash Session Workflow

1. **Opening Session**: Cashier opens daily cash session with initial balances
2. **Transaction Processing**: Process buy/sell transactions throughout the day
3. **Balance Tracking**: Real-time balance updates per currency
4. **Session Monitoring**: Track all movements and transactions
5. **Session Closing**: End-of-day reconciliation and session closure

## 💱 Transaction Types

### Buy Transaction
- Customer sells foreign currency
- System buys currency from customer
- Increases system's foreign currency balance
- Decreases system's local currency balance

### Sell Transaction  
- Customer buys foreign currency
- System sells currency to customer
- Decreases system's foreign currency balance
- Increases system's local currency balance

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit

# Run with coverage
php artisan test --coverage
```

## 🚀 Deployment

### Production Setup
1. Set `APP_ENV=production` in `.env`
2. Configure production database
3. Set up Redis for caching (recommended)
4. Configure mail settings for notifications
5. Set up SSL certificates
6. Configure web server (Apache/Nginx)

### Performance Optimization
```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer install --optimize-autoloader --no-dev
```

## 📊 API Documentation

### Transaction Endpoints
- `GET /transactions` - List transactions
- `POST /transactions` - Create transaction
- `PUT /transactions/{id}` - Update transaction
- `DELETE /transactions/{id}` - Delete transaction

### Cash Session Endpoints
- `GET /cash-sessions` - List cash sessions
- `POST /cash-sessions` - Open new session
- `PUT /cash-sessions/{id}/close` - Close session
- `GET /cash-sessions/{id}` - Session details

### Currency Endpoints
- `GET /currencies` - List currencies
- `POST /currencies` - Add currency
- `PUT /currencies/{id}` - Update currency
- `DELETE /currencies/{id}` - Delete currency

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions, please contact the development team. 