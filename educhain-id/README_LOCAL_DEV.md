# EduChain ID - Local Development Guide

This guide describes how to run the full EduChain ID environment locally for development and testing.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v20+ recommended)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/) & Docker Compose
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

## 1. Setup Environment

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd educhain-id
   ```

2. Configure environment variables. Copy the `.env.example` file to create your local `.env`.
   ```bash
   cp .env.example .env
   ```

3. Start local infrastructure dependencies (PostgreSQL and Redis):
   ```bash
   docker-compose up -d
   ```
   *Make sure port `5432` and `6379` are free.*

## 2. Install Dependencies
Install all monorepo dependencies using `pnpm`:
```bash
pnpm install
```

## 3. Database Migration & Seeding
Initialize the prisma schema and seed your local test data:
```bash
pnpm run db:setup
```
*(This command runs `docker compose up -d`, `prisma migrate dev`, and `prisma seed` within the `apps/api` workspace).*

## 4. Start Development Servers

Run the global Turborepo pipeline to launch all applications parallelly:

```bash
pnpm run dev
```

This single command will orchestrate:
1. **API Server:** Fastify API running on `http://localhost:8001`
2. **Worker Service:** Standalone BullMQ queue processor
3. **Web Dashboard:** Next.js application running on `http://localhost:3000`
4. **Mobile App:** Expo dev server on `http://localhost:8081`

## Health Checks
You can verify the connectivity of your backend architecture by curling the `health` node:
```bash
curl http://localhost:8001/api/v1/health
```

Expected output:
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "database": "connected",
    "timestamp": "2026-03-xTXX:XX:XX.XXXZ",
    "uptime": 12,
    "version": "0.1.0"
  }
}
```

## Stopping the Environment
To graceful stop the application stack:
1. Terminate the terminal running `pnpm run dev` (Ctrl+c).
2. Clean up Docker containers:
   ```bash
   docker-compose down
   ```
