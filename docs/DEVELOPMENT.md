# Development Guide

## Development Environment Setup

### Prerequisites
- PHP 8.1 or higher
- Composer
- Node.js 16+ and npm
- MySQL 8.0+ or PostgreSQL 13+
- Git

### Local Development Setup

#### 1. Clone Repository
```bash
git clone <repository-url>
cd sibai_transactions
```

#### 2. Install Dependencies
```bash
composer install
npm install
```

#### 3. Environment Configuration
```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` for local development:
```env
APP_NAME="Sibai Transactions"
APP_ENV=local
APP_KEY=base64:generated_key_here
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sibai_transactions
DB_USERNAME=root
DB_PASSWORD=

CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file

VITE_APP_NAME="${APP_NAME}"
```

#### 4. Database Setup
```bash
php artisan migrate
php artisan db:seed
```

#### 5. Start Development Servers
```bash
# Terminal 1: Laravel development server
php artisan serve

# Terminal 2: Vite development server
npm run dev
```

### Development Tools

#### Laravel Telescope (Debug Tool)
```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

Access at: `http://localhost:8000/telescope`

#### Laravel Debugbar
```bash
composer require barryvdh/laravel-debugbar --dev
php artisan vendor:publish --provider="Barryvdh\Debugbar\ServiceProvider"
```

#### IDE Helper
```bash
composer require barryvdh/laravel-ide-helper --dev
php artisan ide-helper:generate
php artisan ide-helper:models
php artisan ide-helper:meta
```

### Code Standards

#### PHP Code Style
We follow PSR-12 coding standards with some custom rules:

```bash
# Install PHP CS Fixer
composer require friendsofphp/php-cs-fixer --dev

# Run code formatting
./vendor/bin/php-cs-fixer fix
```

#### TypeScript/JavaScript Standards
We use ESLint and Prettier for code formatting:

```bash
# Install ESLint and Prettier
npm install --save-dev eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Git Workflow

#### Branch Naming Convention
- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes
- `refactor/component-name` - Code refactoring
- `docs/documentation-update` - Documentation updates

#### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Example:
```
feat(transactions): add multi-currency support

- Added currency conversion logic
- Updated transaction form to support currency selection
- Added exchange rate calculation

Closes #123
```

### Testing

#### PHP Testing (PHPUnit)
```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/TransactionTest.php

# Run with coverage
php artisan test --coverage

# Run specific test method
php artisan test --filter testTransactionCreation
```

#### JavaScript Testing (Jest)
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

#### Test Structure
```
tests/
├── Feature/           # Integration tests
│   ├── TransactionTest.php
│   ├── CashSessionTest.php
│   └── AuthenticationTest.php
├── Unit/              # Unit tests
│   ├── TransactionServiceTest.php
│   └── CurrencyTest.php
└── TestCase.php       # Base test class
```

### Database Development

#### Migrations
```bash
# Create new migration
php artisan make:migration create_table_name

# Run migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Reset all migrations
php artisan migrate:reset

# Refresh migrations with seeding
php artisan migrate:refresh --seed
```

#### Seeders
```bash
# Create seeder
php artisan make:seeder TableNameSeeder

# Run specific seeder
php artisan db:seed --class=TableNameSeeder

# Run all seeders
php artisan db:seed
```

#### Factories
```bash
# Create factory
php artisan make:factory ModelNameFactory

# Use in tests
$user = User::factory()->create();
$transactions = Transaction::factory()->count(10)->create();
```

### API Development

#### Creating Controllers
```bash
# Create API controller
php artisan make:controller Api/TransactionController --api

# Create controller with model
php artisan make:controller TransactionController --model=Transaction
```

#### Form Requests
```bash
# Create form request
php artisan make:request StoreTransactionRequest
```

#### Resources
```bash
# Create API resource
php artisan make:resource TransactionResource

# Create resource collection
php artisan make:resource TransactionCollection
```

### Frontend Development

#### Component Structure
```
resources/js/
├── Components/        # Reusable components
│   ├── UI/           # Basic UI components
│   ├── Forms/        # Form components
│   └── Dashboard/    # Dashboard-specific components
├── Layouts/          # Page layouts
├── Pages/            # Page components
├── Hooks/            # Custom React hooks
└── types.ts          # TypeScript definitions
```

#### Creating Components
```typescript
// Example component structure
import React from 'react';

interface Props {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<Props> = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
};

export default Card;
```

#### State Management
We use React hooks and Inertia.js for state management:

```typescript
// Custom hook example
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/transactions');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return { transactions, loading, fetchTransactions };
};
```

### Performance Optimization

#### Backend Optimization
```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

#### Frontend Optimization
```bash
# Build for production
npm run build

# Analyze bundle size
npm run build -- --analyze
```

#### Database Optimization
```php
// Use eager loading
$transactions = Transaction::with(['customer', 'currency'])->get();

// Use database indexes
Schema::table('transactions', function (Blueprint $table) {
    $table->index(['status', 'created_at']);
});

// Use query optimization
$transactions = Transaction::select(['id', 'amount', 'status'])
    ->where('status', 'completed')
    ->orderBy('created_at', 'desc')
    ->limit(100)
    ->get();
```

### Debugging

#### Laravel Debugging
```php
// Debug variables
dd($variable);
dump($variable);

// Log debugging
Log::info('Debug message', ['data' => $data]);
Log::error('Error occurred', ['error' => $exception->getMessage()]);

// Query debugging
DB::enableQueryLog();
// Your queries here
dd(DB::getQueryLog());
```

#### Frontend Debugging
```typescript
// Console debugging
console.log('Debug data:', data);
console.error('Error:', error);

// React DevTools
// Install React DevTools browser extension

// Network debugging
// Use browser developer tools Network tab
```

### Code Quality

#### PHP Static Analysis
```bash
# Install PHPStan
composer require phpstan/phpstan --dev

# Run analysis
./vendor/bin/phpstan analyse
```

#### Code Coverage
```bash
# Generate coverage report
php artisan test --coverage-html coverage-report

# View coverage
open coverage-report/index.html
```

### Environment Variables

#### Development Environment
```env
# Debug settings
APP_DEBUG=true
LOG_LEVEL=debug

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sibai_transactions_dev

# Cache
CACHE_DRIVER=file
QUEUE_CONNECTION=sync

# Mail (use Mailtrap for testing)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
```

#### Testing Environment
```env
# Test database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sibai_transactions_test

# Disable external services
MAIL_MAILER=log
QUEUE_CONNECTION=sync
```

### Common Development Tasks

#### Adding New Currency
1. Update currency seeder
2. Add currency to frontend types
3. Update currency validation rules
4. Test currency conversion logic

#### Creating New Transaction Type
1. Update TransactionType enum
2. Add validation rules
3. Update frontend forms
4. Add tests for new type

#### Adding New User Role
1. Update role seeder
2. Add permissions
3. Update middleware
4. Add role-based UI components

### Troubleshooting

#### Common Issues

1. **Composer Dependencies**
   ```bash
   composer clear-cache
   composer update
   ```

2. **NPM Issues**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Database Issues**
   ```bash
   php artisan migrate:fresh --seed
   ```

4. **Cache Issues**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   ```

5. **Permission Issues**
   ```bash
   chmod -R 775 storage bootstrap/cache
   ```

### Development Best Practices

#### PHP Best Practices
- Use type hints for all method parameters and return types
- Follow SOLID principles
- Use dependency injection
- Write comprehensive tests
- Use meaningful variable and method names
- Keep methods small and focused

#### Frontend Best Practices
- Use TypeScript for type safety
- Create reusable components
- Follow React best practices
- Use proper error handling
- Implement loading states
- Make components accessible

#### Database Best Practices
- Use migrations for schema changes
- Create proper indexes
- Use database transactions for related operations
- Avoid N+1 queries
- Use proper foreign key constraints

### Useful Commands

#### Laravel Artisan Commands
```bash
# List all commands
php artisan list

# Create model with migration and factory
php artisan make:model Transaction -mf

# Create controller with all methods
php artisan make:controller TransactionController --resource

# Create middleware
php artisan make:middleware EnsureUserHasRole

# Create job
php artisan make:job ProcessTransaction

# Create event
php artisan make:event TransactionCreated

# Create listener
php artisan make:listener SendTransactionNotification
```

#### NPM Scripts
```bash
# Development
npm run dev

# Production build
npm run build

# Watch for changes
npm run watch

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
``` 