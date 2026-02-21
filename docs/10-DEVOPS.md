# DevOps & Deployment Plan — EduLink

> Containerized | Docker Compose (dev) → Kubernetes/Docker Swarm (prod)  
> CI/CD: GitHub Actions

---

## 1. Docker Configuration

### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim AS base

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Non-root user
RUN adduser --disabled-password --gecos '' appuser
USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Admin Panel Dockerfile

```dockerfile
# admin-panel/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]
```

---

## 2. Docker Compose — Development

```yaml
# docker-compose.yml
version: '3.9'

services:
  # ═══════════════════════════════════════════
  # DATABASE
  # ═══════════════════════════════════════════
  postgres:
    image: postgres:16-alpine
    container_name: edulink-db
    environment:
      POSTGRES_DB: edulink
      POSTGRES_USER: edulink
      POSTGRES_PASSWORD: ${DB_PASSWORD:-devpassword}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U edulink"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - edulink

  # ═══════════════════════════════════════════
  # REDIS
  # ═══════════════════════════════════════════
  redis:
    image: redis:7-alpine
    container_name: edulink-redis
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - edulink

  # ═══════════════════════════════════════════
  # OBJECT STORAGE (S3-compatible)
  # ═══════════════════════════════════════════
  minio:
    image: minio/minio:latest
    container_name: edulink-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${S3_ACCESS_KEY:-minioadmin}
      MINIO_ROOT_PASSWORD: ${S3_SECRET_KEY:-minioadmin}
    ports:
      - "9000:9000"   # S3 API
      - "9001:9001"   # Console
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 30s
      timeout: 5s
      retries: 3
    networks:
      - edulink

  # ═══════════════════════════════════════════
  # BACKEND (FastAPI)
  # ═══════════════════════════════════════════
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: edulink-api
    environment:
      DATABASE_URL: postgresql+asyncpg://edulink:${DB_PASSWORD:-devpassword}@postgres:5432/edulink
      REDIS_URL: redis://redis:6379/0
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: ${S3_ACCESS_KEY:-minioadmin}
      S3_SECRET_KEY: ${S3_SECRET_KEY:-minioadmin}
      S3_BUCKET: edulink
      JWT_SECRET_KEY: ${JWT_SECRET_KEY:-dev-secret-change-me}
      KEY_ENCRYPTION_KEY: ${KEY_ENCRYPTION_KEY:-0000000000000000000000000000000000000000000000000000000000000000}
      ENVIRONMENT: development
      DEBUG: "true"
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_healthy
    volumes:
      - ./backend/app:/app/app    # Hot reload
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    networks:
      - edulink

  # ═══════════════════════════════════════════
  # BACKGROUND WORKER (ARQ)
  # ═══════════════════════════════════════════
  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: edulink-worker
    environment:
      DATABASE_URL: postgresql+asyncpg://edulink:${DB_PASSWORD:-devpassword}@postgres:5432/edulink
      REDIS_URL: redis://redis:6379/0
      S3_ENDPOINT: http://minio:9000
      ENVIRONMENT: development
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: arq app.tasks.worker.WorkerSettings
    networks:
      - edulink

  # ═══════════════════════════════════════════
  # ADMIN PANEL (Next.js)
  # ═══════════════════════════════════════════
  admin:
    build:
      context: ./admin-panel
      dockerfile: Dockerfile
    container_name: edulink-admin
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
      JWT_SECRET: ${JWT_SECRET_KEY:-dev-secret-change-me}
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - edulink

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  edulink:
    driver: bridge
```

---

## 3. Docker Compose — Production

```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  # Nginx reverse proxy with TLS
  nginx:
    image: nginx:alpine
    container_name: edulink-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
    depends_on:
      - backend
      - admin
    networks:
      - edulink
    restart: always

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      S3_ENDPOINT: ${S3_ENDPOINT}
      S3_ACCESS_KEY: ${S3_ACCESS_KEY}
      S3_SECRET_KEY: ${S3_SECRET_KEY}
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      KEY_ENCRYPTION_KEY: ${KEY_ENCRYPTION_KEY}
      ENVIRONMENT: production
      DEBUG: "false"
    restart: always
    networks:
      - edulink

  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    deploy:
      replicas: 2
    command: arq app.tasks.worker.WorkerSettings
    restart: always
    networks:
      - edulink

  admin:
    build:
      context: ./admin-panel
      dockerfile: Dockerfile
    deploy:
      replicas: 2
    restart: always
    networks:
      - edulink

networks:
  edulink:
    driver: bridge
```

---

## 4. Nginx Configuration

```nginx
# nginx/conf.d/edulink.conf

upstream backend {
    least_conn;
    server backend:8000;
}

upstream admin {
    least_conn;
    server admin:3000;
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

server {
    listen 443 ssl http2;
    server_name api.edulink.dev;

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols       TLSv1.3;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # API routes
    location /api/v1/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Stricter rate limit on auth
    location /api/v1/auth/ {
        limit_req zone=auth burst=3 nodelay;
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 443 ssl http2;
    server_name admin.edulink.dev;

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;
    ssl_protocols       TLSv1.3;

    location / {
        proxy_pass http://admin;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name api.edulink.dev admin.edulink.dev;
    return 301 https://$host$request_uri;
}
```

---

## 5. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ═══════════════════════════════════════
  # Backend Tests
  # ═══════════════════════════════════════
  backend-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: edulink_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']

    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt -r requirements-dev.txt
      
      - name: Lint & format check
        run: |
          cd backend
          ruff check .
          ruff format --check .
          mypy app/
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql+asyncpg://test:test@localhost:5432/edulink_test
          REDIS_URL: redis://localhost:6379/0
          JWT_SECRET_KEY: test-secret
          KEY_ENCRYPTION_KEY: '0000000000000000000000000000000000000000000000000000000000000000'
        run: |
          cd backend
          pytest --cov=app --cov-report=xml --cov-fail-under=80
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: backend/coverage.xml

  # ═══════════════════════════════════════
  # Admin Panel Tests
  # ═══════════════════════════════════════
  admin-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: admin-panel/package-lock.json
      
      - name: Install & lint
        run: |
          cd admin-panel
          npm ci
          npm run lint
          npm run type-check
      
      - name: Run tests
        run: |
          cd admin-panel
          npm test -- --coverage
      
      - name: Build
        run: |
          cd admin-panel
          npm run build

  # ═══════════════════════════════════════
  # Docker Build & Push
  # ═══════════════════════════════════════
  docker-build:
    runs-on: ubuntu-latest
    needs: [backend-test, admin-test]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: docker/setup-buildx-action@v3
      
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build & push backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/backend:latest
            ghcr.io/${{ github.repository }}/backend:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Build & push admin
        uses: docker/build-push-action@v5
        with:
          context: ./admin-panel
          push: true
          tags: |
            ghcr.io/${{ github.repository }}/admin:latest
            ghcr.io/${{ github.repository }}/admin:${{ github.sha }}

  # ═══════════════════════════════════════
  # Deploy to Staging
  # ═══════════════════════════════════════
  deploy-staging:
    runs-on: ubuntu-latest
    needs: docker-build
    environment: staging
    
    steps:
      - name: Deploy to staging
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.STAGING_HOST }}
          username: ${{ secrets.STAGING_USER }}
          key: ${{ secrets.STAGING_SSH_KEY }}
          script: |
            cd /opt/edulink
            docker compose -f docker-compose.prod.yml pull
            docker compose -f docker-compose.prod.yml up -d --remove-orphans
            docker system prune -f
```

---

## 6. Environment Variables Template

```bash
# .env.example

# ═══════════════════════ App ═══════════════════════
APP_NAME=EduLink
ENVIRONMENT=production          # development | staging | production
DEBUG=false

# ═══════════════════════ Database ═══════════════════
DATABASE_URL=postgresql+asyncpg://edulink:STRONG_PASSWORD@db-host:5432/edulink
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# ═══════════════════════ Redis ═══════════════════════
REDIS_URL=redis://redis-host:6379/0

# ═══════════════════════ JWT ═══════════════════════
JWT_SECRET_KEY=generate-with-openssl-rand-base64-64
JWT_ALGORITHM=RS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# ═══════════════════════ Cryptography ═══════════════
KEY_ENCRYPTION_KEY=64-hex-chars-256-bit-key-for-aes-gcm

# ═══════════════════════ S3 Storage ═══════════════════
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=edulink-prod

# ═══════════════════════ Email ═══════════════════════
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
FROM_EMAIL=noreply@edulink.dev

# ═══════════════════════ CORS ═══════════════════════
CORS_ORIGINS=["https://admin.edulink.dev","https://recruiter.edulink.dev"]

# ═══════════════════════ Rate Limiting ═══════════════
RATE_LIMIT_PER_MINUTE=60

# ═══════════════════════ QR ═══════════════════════
QR_TOKEN_EXPIRY_MINUTES=10
```

---

## 7. Database Migration Strategy

```bash
# Development workflow
cd backend

# Create new migration
alembic revision --autogenerate -m "add_endorsements_table"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1

# Production: run as init container / pre-deploy step
docker compose exec backend alembic upgrade head
```

---

## 8. Backup Strategy

| What | Frequency | Retention | Method |
|---|---|---|---|
| PostgreSQL full backup | Daily | 30 days | `pg_dump` to S3 |
| PostgreSQL WAL archiving | Continuous | 7 days | `pg_basebackup` + WAL-G |
| S3 objects | N/A | Versioned | S3 versioning + lifecycle |
| Redis | Hourly RDB | 24 hours | `redis-cli bgsave` to S3 |
| Config/secrets | On change | Indefinite | Git (encrypted) / Vault |

```bash
# Automated backup script (cron: 0 2 * * *)
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="edulink_backup_${TIMESTAMP}.sql.gz"

pg_dump -h localhost -U edulink edulink | gzip > /tmp/$BACKUP_FILE
aws s3 cp /tmp/$BACKUP_FILE s3://edulink-backups/postgres/$BACKUP_FILE
rm /tmp/$BACKUP_FILE

echo "Backup completed: $BACKUP_FILE"
```
