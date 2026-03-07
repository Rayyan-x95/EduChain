# EduChain ID

Verified student identity and collaboration platform.

## Architecture

- **Backend:** Node.js + Fastify + TypeScript (Modular Monolith)
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Redis (Upstash)
- **Auth:** Supabase JWT + Google OAuth + Argon2id
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Mobile:** Expo (React Native)
- **Crypto:** W3C DID/VC + Open Badges 3.0
- **Monorepo:** Turborepo

## Project Structure

```
educhain-id/
├── apps/
│   ├── api/          # Fastify backend
│   ├── mobile/       # Expo (React Native) student app
│   └── web/          # Next.js dashboards & student portal
├── packages/
│   ├── auth/         # Shared Supabase auth helpers
│   ├── types/        # Shared TypeScript types
│   ├── validators/   # Shared Zod validation schemas
│   └── ui/           # Shared UI components
├── infrastructure/
│   ├── monitoring/   # Prometheus, Grafana, alert rules
│   └── terraform/    # IaC modules (VPC, ECS, RDS, etc.)
├── docs/             # Production deployment & DR guides
└── .github/workflows/
    └── ci.yml        # CI pipeline
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm 10+

### 1. Clone and install

```bash
cd educhain-id
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env` with your values (the defaults work with Docker Compose).

### 3. Start database and Redis

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 4. Run database migrations

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
cd ../..
```

### 5. Start the API server

```bash
npm run dev --workspace=@educhain/api
```

The API starts at **http://localhost:3000**.

### Health Check

```bash
curl http://localhost:3000/api/v1/health
```

## API Endpoints (Phase 1)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/health` | Health check | No |
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login | No |
| POST | `/api/v1/auth/refresh` | Refresh access token | No |
| POST | `/api/v1/auth/logout` | Logout (revoke tokens) | Yes |

### Register

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "student@test.com", "password": "SecureP@ss1", "role": "student"}'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@test.com", "password": "SecureP@ss1"}'
```

### Refresh Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<your_refresh_token>"}'
```

### Logout

```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -H "Authorization: Bearer <your_access_token>"
```

## Running Tests

```bash
npm run test --workspace=@educhain/api
```

## Running Full Docker Stack

```bash
docker compose up --build
```

This starts the API, PostgreSQL, and Redis together.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all apps in dev mode |
| `npm run build` | Build all packages + apps |
| `npm run lint` | Lint all projects |
| `npm run test` | Run all tests |
| `npm run typecheck` | TypeScript type checking |

## Roles

| Role | Description |
|------|-------------|
| `student` | Student users |
| `institution_admin` | Institution administrators |
| `recruiter` | Recruiters |
| `platform_admin` | Platform administrators |
