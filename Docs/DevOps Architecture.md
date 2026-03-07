# DevOps Architecture Document

**Product:** EduChain ID
**Date:** March 2026
**Status:** Active Development

---

## 1. DevOps Goals

The DevOps system ensures:

- **Automated deployments** via GitHub Actions CI/CD
- **High availability** through managed cloud services
- **Scalable infrastructure** with stateless backend design
- **Reliable monitoring** via Sentry error tracking and structured logging
- **Secure environments** with secret management and TLS everywhere

### Core Principles

- Infrastructure as Code (Terraform modules available)
- CI/CD automation via GitHub Actions
- Stateless backend services (horizontally scalable)
- Managed infrastructure (Supabase, Upstash, Vercel, Railway)
- Docker-based API deployments

---

## 2. Deployment Architecture

### High-Level Infrastructure

```
Users
   │
   ├───────────────────────────────┐
   │                               │
Vercel CDN                    App Stores
(Next.js Web)                 (Expo Mobile)
   │                               │
   └───────────┬───────────────────┘
               │
        API Server (Railway / Fly.io)
        Docker Container
               │
   ┌───────────┼───────────┬──────────────┐
   │           │           │              │
   ▼           ▼           ▼              ▼
Supabase    Upstash     Supabase       Sentry
PostgreSQL  Redis       Storage        Error
(Database)  (Cache +    (Files)        Tracking
            Queue)
```

### Component Mapping

| Component | Platform | Purpose |
|---|---|---|
| Web App (Next.js) | Vercel | Automatic deploys, preview per PR, CDN |
| API (Fastify) | Railway / Fly.io | Docker container, health-check rolling deploys |
| Mobile (Expo) | EAS Build → Stores | Native builds, OTA updates for JS changes |
| Database | Supabase PostgreSQL | Managed, connection pooling, backups |
| Auth | Supabase Auth | Google OAuth + email/password, session management |
| Cache + Queue | Upstash Redis (TLS) | Search caching, BullMQ job backend |
| File Storage | Supabase Storage | Certificates, avatars, signed URL access |
| Monitoring | Sentry | Error tracking across API, web, mobile |

---

## 3. Infrastructure Platform

### Current Stack (Startup Phase)

EduChain uses **managed cloud services** to minimize operational overhead:

| Service | Provider | Why |
|---|---|---|
| Database | Supabase | Managed PostgreSQL + Auth + Storage in one platform |
| Redis | Upstash | Serverless Redis with TLS, pay-per-request |
| Web Hosting | Vercel | Optimized for Next.js, automatic scaling |
| API Hosting | Railway / Fly.io | Docker container hosting with health checks |
| CI/CD | GitHub Actions | Integrated with repository, free tier sufficient |
| Error Tracking | Sentry | SDKs for Node.js, React, React Native |

### Production-Scale Stack (AWS — Terraform Ready)

Terraform modules exist in `infrastructure/terraform/` for AWS migration:

| Module | Resource | Purpose |
|---|---|---|
| `vpc` | VPC + Subnets | Network isolation |
| `alb` | Application Load Balancer | HTTPS termination, health checks |
| `ecs` | ECS Fargate | Container orchestration |
| `rds` | RDS PostgreSQL | Managed database |
| `redis` | ElastiCache Redis | Managed cache cluster |
| `s3` | S3 Bucket | File storage |
| `secrets` | AWS Secrets Manager | Secret management |
| `ecr` | Elastic Container Registry | Docker image storage |

---

## 4. Environment Strategy

| Environment | Purpose | Infrastructure | Trigger |
|---|---|---|---|
| **Development** | Local development | Docker Compose (PostgreSQL + Redis) | Manual |
| **Staging** | QA + integration testing | Supabase (staging project) + Railway | Push to `develop` |
| **Production** | Live users | Supabase (prod) + Vercel + Railway | Push to `main` |

### Development Environment

```
docker-compose.dev.yml:
  ┌──────────────────────┐
  │ api (Fastify)        │ ← tsx watch (hot reload)
  │ Port: 3000           │
  ├──────────────────────┤
  │ postgres (16)        │ ← Persistent volume
  │ Port: 5432           │
  ├──────────────────────┤
  │ redis (7)            │ ← Persistent volume
  │ Port: 6379           │
  └──────────────────────┘

Start: docker compose -f docker-compose.dev.yml up
```

### Environment Variables

```
# Database — Supabase PostgreSQL
DATABASE_URL=postgresql://...

# Auth — Supabase JWT verification
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<service role key>
SUPABASE_ANON_KEY=<anon key>
SUPABASE_JWT_SECRET=<supabase jwt secret>
SUPABASE_STORAGE_BUCKET=educhain-files

# Internal JWT (refresh tokens)
JWT_SECRET=<min 16 chars>
JWT_REFRESH_SECRET=<min 16 chars>

# Upstash Redis
REDIS_URL=rediss://<upstash-endpoint>:6379

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@educhain.dev

# Monitoring
SENTRY_DSN=https://...@sentry.io/...

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://educhain.com,https://app.educhain.com

# Client-side (Next.js public)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
NEXT_PUBLIC_API_URL=https://api.educhain.com
```

---

## 5. CI/CD Pipeline

### GitHub Actions Workflows

#### Workflow 1: CI (every PR)

```
┌──────────────────────────────────────────────┐
│ Trigger: Pull Request to any branch           │
├──────────────────────────────────────────────┤
│ 1. Checkout code                              │
│ 2. Setup Node.js 20                           │
│ 3. Install dependencies (npm ci)              │
│ 4. turbo run build (all packages)             │
│ 5. turbo run lint (all packages)              │
│ 6. turbo run typecheck (all packages)         │
│ 7. turbo run test (Jest, all packages)        │
│ 8. npm audit (dependency security check)      │
└──────────────────────────────────────────────┘
```

#### Workflow 2: Deploy Staging (merge to develop)

```
┌──────────────────────────────────────────────┐
│ Trigger: Push to develop branch               │
├──────────────────────────────────────────────┤
│ 1. Run full CI checks                         │
│ 2. Build API Docker image                     │
│ 3. Push to container registry                 │
│ 4. Run Prisma migrations (staging DB)         │
│ 5. Deploy API to Railway (staging)            │
│ 6. Deploy web to Vercel (staging)             │
│ 7. Run smoke tests against staging            │
└──────────────────────────────────────────────┘
```

#### Workflow 3: Deploy Production (merge to main)

```
┌──────────────────────────────────────────────┐
│ Trigger: Push to main branch                  │
├──────────────────────────────────────────────┤
│ 1. Run full CI checks                         │
│ 2. Build API Docker image                     │
│ 3. Push to container registry                 │
│ 4. ⏸️  Manual approval gate                    │
│ 5. Run Prisma migrations (production DB)      │
│ 6. Deploy API to Railway (production)         │
│ 7. Deploy web to Vercel (production)          │
│ 8. Run smoke tests                            │
│ 9. Notify team on success/failure             │
└──────────────────────────────────────────────┘
```

---

## 6. Repository Strategy

### Monorepo Structure (Turborepo)

```
educhain-id/
├── apps/
│   ├── api/          # Fastify API server
│   ├── web/          # Next.js web application
│   └── mobile/       # React Native (Expo)
├── packages/
│   ├── types/        # @educhain/types
│   ├── validators/   # @educhain/validators
│   ├── auth/         # @educhain/auth (Supabase clients)
│   └── ui/           # @educhain/ui
├── infrastructure/
│   ├── terraform/    # AWS Terraform modules
│   └── monitoring/   # Prometheus/Grafana configs
└── docs/
```

### Branch Strategy

| Branch | Purpose | Deploys To |
|---|---|---|
| `main` | Production-ready code | Production |
| `develop` | Integration branch | Staging |
| `feature/*` | Feature development | — |
| `bugfix/*` | Bug fixes | — |
| `hotfix/*` | Emergency production fixes | Production |

### Commit Convention

```
feat(auth): add Supabase Google OAuth integration
fix(credentials): handle null signature in verification
chore(deps): update @supabase/supabase-js to 2.98
docs(security): update authentication architecture
```

---

## 7. Containerization

### API Dockerfile (Multi-Stage Build)

```
Stage 1: Builder
  - Base: node:20-alpine
  - npm ci (install dependencies)
  - tsc (TypeScript compilation)

Stage 2: Production
  - Base: node:20-alpine
  - Copy dist/ + node_modules (production only)
  - Non-root user (security)
  - Health check: GET /api/v1/health
  - Expose port 3000
```

### Docker Compose (Development)

```yaml
services:
  api:
    build: .
    ports: ["3000:3000"]
    volumes: ["./apps/api/src:/app/apps/api/src"]  # Hot reload
    env_file: .env

  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    volumes: ["redisdata:/data"]
```

---

## 8. Database Management

### Prisma Migrations

| Command | Purpose | When |
|---|---|---|
| `npm run db:migrate` | Create + apply migration (dev) | During development |
| `npm run db:migrate:deploy` | Apply pending migrations | CI/CD staging/production |
| `npm run db:generate` | Regenerate Prisma client | After schema changes |
| `npm run db:studio` | Visual data browser | Development debugging |

### Migration in CI/CD

```
1. Developer creates migration locally (prisma migrate dev)
2. Migration file committed to repository
3. CI pipeline runs prisma migrate deploy on staging DB
4. After approval, same migration applied to production DB
```

### Backup Strategy

| Aspect | Provider | Detail |
|---|---|---|
| Database backups | Supabase | Automatic, continuous (PITR) |
| Backup retention | Supabase | Per plan (7+ days) |
| Recovery | Supabase | Point-in-time restore via dashboard |
| Schema recovery | Prisma | Rebuild from migration history |

---

## 9. Monitoring & Observability

### Error Tracking — Sentry

| Platform | SDK | Source Maps |
|---|---|---|
| API (Fastify) | @sentry/node | N/A (server-side) |
| Web (Next.js) | @sentry/nextjs | Uploaded on build |
| Mobile (Expo) | @sentry/react-native | Uploaded via EAS |

**Context captured:**
- User ID (when authenticated)
- Endpoint (`${method} ${url}`)
- Request ID (x-request-id)
- Environment (development/staging/production)

### Application Metrics

**lib/metrics.ts** — Lightweight in-process counters:
- `http_requests_total` — total request count
- `http_errors_total` — total error count
- `http_request_duration` — latency histogram

**Exposed via:** `GET /metrics` endpoint

### Structured Logging — Pino

- JSON format for machine parsing
- Request ID propagation for tracing
- Log levels: `info` (default), `warn`, `error`
- Integrated with Fastify's built-in logger

### Health Check

```
GET /api/v1/health

Response:
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2026-03-07T00:00:00.000Z",
    "uptime": 86400,
    "version": "0.1.0"
  }
}
```

Used by Railway/Fly.io for readiness and liveness probes.

---

## 10. Alerting

### Alert Scenarios

| Event | Severity | Action |
|---|---|---|
| API error rate > 5% | High | Sentry alert → team notification |
| Health check failure | Critical | Platform auto-restart + alert |
| Database connection failure | Critical | Sentry alert + manual investigation |
| Unhandled exception | High | Sentry capture with full context |
| Rate limit spike | Medium | Review in logs |

### Notification Channels

- **Sentry** → Email + Slack integration
- **Railway/Vercel** → Built-in deployment failure notifications
- **GitHub Actions** → PR status checks

---

## 11. Security in DevOps

### Secret Management

| Secret | Storage |
|---|---|
| `SUPABASE_JWT_SECRET` | Platform env vars (Railway/Vercel) |
| `SUPABASE_SERVICE_KEY` | Platform env vars |
| `DATABASE_URL` | Platform env vars |
| `RESEND_API_KEY` | Platform env vars |
| `SENTRY_DSN` | Platform env vars |
| RSA private keys | Reference-based (private_key_ref) |

**Rules:**
- No secrets committed to repository
- `.env.example` contains placeholder values only
- Secrets injected at runtime via deployment platform

### Dependency Security

| Tool | Purpose | When |
|---|---|---|
| `npm audit` | Vulnerability scanning | Every CI run |
| Dependabot | Automated dependency updates | Weekly PRs |
| Type checking | Catch type-level bugs | Every CI run |

---

## 12. Disaster Recovery

### Recovery Plan

| Scenario | Recovery |
|---|---|
| Database failure | Supabase point-in-time restore |
| API server crash | Auto-restart by platform (Railway/Fly.io) |
| Deployment failure | Rollback to previous version |
| Redis unavailability | App continues without cache (degraded) |
| Auth provider outage | Email/password fallback, tokens valid until expiry |

### Recovery Targets

| Metric | Target |
|---|---|
| Recovery Time Objective (RTO) | < 30 minutes |
| Recovery Point Objective (RPO) | < 5 minutes (Supabase PITR) |

---

## 13. Scaling Strategy

### Horizontal Scaling

```
Auto-scaling triggers:
  CPU > 70% → add instance
  CPU < 30% → remove instance

Scalable components:
  - API server (stateless, multiple Docker instances)
  - BullMQ workers (independent scaling)

Non-scalable (managed):
  - Database (Supabase handles scaling)
  - Redis (Upstash serverless, auto-scales)
  - Storage (Supabase Storage, auto-scales)
```

### Cost Optimization

| Strategy | Implementation |
|---|---|
| Managed services | Supabase + Upstash reduce ops overhead |
| Auto-scaling | Scale to zero when idle (Upstash Redis) |
| Turborepo caching | Remote cache for faster CI builds |
| Docker multi-stage | Smaller production images |
| Preview deployments | Vercel preview per PR (no always-on staging web) |

---

## 14. Infrastructure as Code

### Terraform Modules (infrastructure/terraform/)

```
main.tf
├── module "vpc"       → VPC + subnets
├── module "alb"       → Application Load Balancer
├── module "ecs"       → ECS Fargate cluster + services
├── module "rds"       → PostgreSQL RDS instance
├── module "redis"     → ElastiCache cluster
├── module "s3"        → Private S3 bucket
├── module "secrets"   → AWS Secrets Manager
└── module "ecr"       → Container registry

variables.tf           → Configurable parameters
outputs.tf             → Resource identifiers
production.tfvars      → Production values
```

These modules are ready for production-scale AWS deployment when traffic exceeds managed service capacity.

---

## Final DevOps Architecture Summary

```
Developer → GitHub (push)
    │
GitHub Actions (CI/CD)
    │
    ├─ Build + Test + Typecheck (Turborepo)
    ├─ Deploy Web → Vercel
    ├─ Deploy API → Railway (Docker)
    ├─ Migrate DB → Supabase (Prisma)
    │
    ▼
Users
    │
    ├─ Web → Vercel CDN → Next.js
    ├─ Mobile → App Store / Google Play → Expo
    │
    └─ API → Railway (Docker)
           ├─ Supabase PostgreSQL
           ├─ Upstash Redis (TLS)
           ├─ Supabase Storage
           └─ Sentry (monitoring)
```

### Technology Stack Summary

| Layer | Technology |
|---|---|
| Web Hosting | Vercel |
| API Hosting | Railway / Fly.io |
| Mobile Build | Expo EAS |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Cache | Upstash Redis |
| Storage | Supabase Storage |
| Email | Resend |
| CI/CD | GitHub Actions |
| Monitoring | Sentry |
| Logging | Pino (structured JSON) |
| IaC | Terraform (AWS modules) |
| Monorepo | Turborepo 2 |
