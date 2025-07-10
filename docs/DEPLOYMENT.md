# Deployment Guide

## Production Deployment

### Prerequisites

#### Server Requirements

- **OS**: Ubuntu 20.04 LTS or CentOS 8
- **CPU**: 2+ cores
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 50GB minimum, SSD recommended
- **Network**: Static IP address, SSL certificate

#### Software Requirements

- **PHP**: 8.1 or higher with extensions:
  - bcmath, ctype, fileinfo, json, mbstring, openssl, pdo, tokenizer, xml, zip
- **Web Server**: Nginx or Apache
- **Database**: MySQL 8.0+ or PostgreSQL 13+
- **Node.js**: 16+ with npm
- **Redis**: 6.0+ (optional but recommended)
- **Supervisor**: For queue processing

### Server Setup

#### 1. Update System

```bash
sudo apt update
sudo apt upgrade -y
```

#### 2. Install PHP 8.1

```bash
sudo apt install software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install php8.1-fpm php8.1-cli php8.1-common php8.1-mysql \
    php8.1-zip php8.1-gd php8.1-mbstring php8.1-curl php8.1-xml \
    php8.1-bcmath php8.1-json php8.1-tokenizer php8.1-intl
```

#### 3. Install Composer

```bash
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

#### 4. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 5. Install MySQL

```bash
sudo apt install mysql-server
sudo mysql_secure_installation
```

#### 6. Install Nginx

```bash
sudo apt install nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 7. Install Redis (Optional)

```bash
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

#### 8. Install Supervisor

```bash
sudo apt install supervisor
sudo systemctl start supervisor
sudo systemctl enable supervisor
```

### Application Deployment

#### 1. Clone Repository

```bash
cd /var/www
sudo git clone <repository-url> sibai_transactions
sudo chown -R www-data:www-data sibai_transactions
cd sibai_transactions
```

#### 2. Install Dependencies

```bash
composer install --optimize-autoloader --no-dev
npm install
npm run build
```

#### 3. Environment Configuration

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` file:

```env
APP_NAME="Sibai Transactions"
APP_ENV=production
APP_KEY=base64:generated_key_here
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sibai_transactions
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"
```

#### 4. Database Setup

```bash
php artisan migrate --force
php artisan db:seed --force
```

#### 5. Cache and Optimize

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

#### 6. Set Permissions

```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### Web Server Configuration

#### Nginx Configuration

Create `/etc/nginx/sites-available/sibai_transactions`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    root /var/www/sibai_transactions/public;

    index index.php;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Cache static assets
    location ~* \.(css|js|gif|jpe?g|png|svg|woff2?|ttf|eot|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/sibai_transactions /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Queue Configuration

#### Supervisor Configuration

Create `/etc/supervisor/conf.d/sibai_transactions.conf`:

```ini
[program:sibai_transactions]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/sibai_transactions/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/sibai_transactions/storage/logs/worker.log
stopwaitsecs=3600
```

Start the queue workers:

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start sibai_transactions:*
```

### SSL Certificate

#### Using Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Auto-renewal

```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Monitoring and Logging

#### Log Rotation

Create `/etc/logrotate.d/sibai_transactions`:

```
/var/www/sibai_transactions/storage/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        /bin/kill -USR1 `cat /var/run/php/php8.1-fpm.pid 2> /dev/null` 2> /dev/null || true
    endscript
}
```

#### Health Check Script

Create `/var/www/sibai_transactions/health-check.sh`:

```bash
#!/bin/bash

# Check if application is responding
if curl -f -s http://localhost/health > /dev/null; then
    echo "Application is healthy"
    exit 0
else
    echo "Application is not responding"
    exit 1
fi
```

### Backup Strategy

#### Database Backup Script

Create `/var/www/sibai_transactions/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/var/backups/sibai_transactions"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="sibai_transactions"
DB_USER="your_db_user"
DB_PASS="your_db_password"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

# Application files backup (optional)
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/sibai_transactions --exclude=node_modules --exclude=vendor
```

#### Cron Job for Automated Backups

```bash
sudo crontab -e
# Add this line for daily backup at 2 AM:
0 2 * * * /var/www/sibai_transactions/backup.sh
```

### Security Hardening

#### Firewall Configuration

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

#### PHP Security

Edit `/etc/php/8.1/fpm/php.ini`:

```ini
expose_php = Off
display_errors = Off
display_startup_errors = Off
log_errors = On
error_log = /var/log/php_errors.log
allow_url_fopen = Off
allow_url_include = Off
session.cookie_httponly = 1
session.cookie_secure = 1
session.use_strict_mode = 1
```

#### File Permissions

```bash
sudo find /var/www/sibai_transactions -type f -exec chmod 644 {} \;
sudo find /var/www/sibai_transactions -type d -exec chmod 755 {} \;
sudo chmod -R 775 /var/www/sibai_transactions/storage
sudo chmod -R 775 /var/www/sibai_transactions/bootstrap/cache
```

### Performance Optimization

#### PHP-FPM Configuration

Edit `/etc/php/8.1/fpm/pool.d/www.conf`:

```ini
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500
```

#### MySQL Optimization

Edit `/etc/mysql/mysql.conf.d/mysqld.cnf`:

```ini
innodb_buffer_pool_size = 2G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
query_cache_size = 128M
query_cache_type = 1
```

#### Redis Configuration

Edit `/etc/redis/redis.conf`:

```ini
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### Deployment Script

Create `/var/www/sibai_transactions/deploy.sh`:

```bash
#!/bin/bash

echo "Starting deployment..."

# Pull latest code
git pull origin main

# Install/update dependencies
composer install --optimize-autoloader --no-dev
npm install
npm run build

# Clear and cache
php artisan down
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Run migrations
php artisan migrate --force

# Restart services
sudo supervisorctl restart sibai_transactions:*
sudo systemctl reload php8.1-fpm
sudo systemctl reload nginx

php artisan up

echo "Deployment completed successfully!"
```

### Monitoring

#### Application Monitoring

```bash
# Check application status
php artisan queue:monitor
php artisan horizon:status

# Check logs
tail -f storage/logs/laravel.log
tail -f storage/logs/worker.log
```

#### System Monitoring

```bash
# Check system resources
htop
df -h
free -h

# Check services
sudo systemctl status nginx
sudo systemctl status php8.1-fpm
sudo systemctl status mysql
sudo systemctl status redis
sudo supervisorctl status
```

### Troubleshooting

#### Common Issues

1. **Permission Errors**

   ```bash
   sudo chown -R www-data:www-data storage bootstrap/cache
   sudo chmod -R 775 storage bootstrap/cache
   ```

2. **Queue Not Processing**

   ```bash
   sudo supervisorctl restart sibai_transactions:*
   php artisan queue:restart
   ```

3. **Cache Issues**

   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   ```

4. **Database Connection Issues**
   ```bash
   php artisan tinker
   DB::connection()->getPdo();
   ```

### Rollback Procedure

In case of deployment issues:

```bash
# Rollback to previous version
git reset --hard HEAD~1

# Restore dependencies
composer install --optimize-autoloader --no-dev
npm install
npm run build

# Clear cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
sudo supervisorctl restart sibai_transactions:*
sudo systemctl reload php8.1-fpm
```
