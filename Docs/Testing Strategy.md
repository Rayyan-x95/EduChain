# Testing Strategy

**Product:** EduChain ID
**Date:** March 2026
**Status:** Active Development
**Framework:** Jest 29 + Supertest + Playwright

---

## 1. Overview

EduChain follows a **testing pyramid** strategy: many fast unit tests, focused integration tests, and selective end-to-end tests. The goal is high confidence with fast CI feedback.

### Testing Goals

- **Correctness:** All business logic verified through unit tests
- **Integration confidence:** API endpoints tested against real request/response cycles
- **Credential integrity:** Cryptographic signing/verification tested in isolation
- **Security:** Auth middleware, role guards, and input validation tested
- **Regression prevention:** Tests run on every PR via GitHub Actions CI

---

## 2. Testing Pyramid

```
           ┌──────────┐
           │   E2E    │  Few, critical user flows
           │ Playwright│  (Web: Next.js, Mobile: Detox)
           ├──────────┤
           │          │
       ┌───┤Integration├───┐  API endpoints with Supertest
       │   │  Tests   │   │  Database integration (Prisma)
       │   ├──────────┤   │
       │   │          │   │
   ┌───┤   │  Unit    │   ├───┐  Services, utils, crypto
   │   │   │  Tests   │   │   │  Validation schemas
   │   │   │          │   │   │  Middleware logic
   └───┴───┴──────────┴───┴───┘
```

| Layer | Tool | Count Target | Speed | Scope |
|---|---|---|---|---|
| Unit | Jest | ~70% of tests | < 5s total | Functions, services, validators |
| Integration | Jest + Supertest | ~25% | < 30s total | API routes, DB queries |
| E2E | Playwright / Detox | ~5% | < 2 min | Critical user flows |

---

## 3. Test Configuration

### Jest Setup

**Config:** `apps/api/jest.config.cjs`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### Test Scripts (package.json)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --forceExit"
  }
}
```

### Turborepo Integration

```bash
# Run all tests across monorepo
turbo run test

# Run tests for API only
turbo run test --filter=api
```

---

## 4. Unit Tests

### 4.1 Cryptographic Functions

**File:** `src/lib/credential.crypto.test.ts`

| Test | Description |
|---|---|
| Key pair generation | `generateInstitutionKeyPair()` returns valid RSA-2048 PEM keys |
| Hash generation | `generateCredentialHash()` produces consistent SHA-256 hashes |
| Sign + verify round-trip | Sign with private key, verify with public key → true |
| Tampered hash detection | Modified hash fails verification → false |
| Wrong key detection | Verify with different public key → false |

### 4.2 Password Hashing

**File:** `src/lib/password.test.ts`

| Test | Description |
|---|---|
| Hash + verify | `hashPassword()` → `verifyPassword()` returns true |
| Wrong password | Different password → `verifyPassword()` returns false |
| Unique salts | Same password hashed twice produces different hashes |

### 4.3 JWT Functions

**File:** `src/lib/jwt.test.ts`

| Test | Description |
|---|---|
| Token generation | `generateToken()` returns valid JWT string |
| Token verification | `verifyToken()` decodes payload correctly |
| Expiration | Expired tokens throw error on verification |
| Invalid tokens | Malformed tokens throw error |

### 4.4 Search Cache

**File:** `src/lib/search.cache.test.ts`

| Test | Description |
|---|---|
| Cache set + get | Cached result returns on second call |
| Cache miss | New query returns null |
| Cache invalidation | Pattern-based invalidation clears related keys |
| TTL expiration | Cached data expires after TTL |

### 4.5 Validation Schemas

**Location:** `packages/validators/src/*.ts`

Each validator module should be tested:

| Module | Key Tests |
|---|---|
| `auth.ts` | Valid/invalid email, password strength, role enum |
| `student.ts` | Required fields, optional fields, visibility enum |
| `skill.ts` | Skill name validation |
| `project.ts` | Title required, repoLink URL format |
| `achievement.ts` | Date format, title required |
| `credential.ts` | Credential type enum, required fields |
| `collaboration.ts` | Follow/request payloads |
| `recruiter.ts` | Company name required |
| `search.ts` | Query string sanitization |

---

## 5. Integration Tests

### 5.1 API Route Testing

Integration tests use **Supertest** against the Fastify app instance:

```typescript
import { buildApp } from '../app';

describe('POST /api/v1/auth/register', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should register a new student', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        email: 'test@example.com',
        password: 'SecureP@ss1',
        role: 'student',
        fullName: 'Test User'
      }
    });
    expect(res.statusCode).toBe(201);
    expect(JSON.parse(res.body).success).toBe(true);
  });

  it('should reject duplicate email', async () => {
    // ... register same email twice
    expect(res.statusCode).toBe(409);
  });
});
```

### 5.2 Module Test Coverage Targets

| Module | Priority | Key Scenarios |
|---|---|---|
| Auth | Critical | Register, login, refresh, logout, invalid credentials |
| Students | High | Create profile, update, visibility enforcement |
| Credentials | Critical | Issue, sign, verify, revoke, public verification |
| Verifications | High | Request, approve, reject, role enforcement |
| Search | Medium | Full-text search, caching, pagination |
| Collaboration | Medium | Follow/unfollow, requests, groups |
| Notifications | Medium | List, mark read |
| Recruiters | Medium | Profile, browse, shortlist |
| Uploads | Medium | File upload, storage integration |
| Audit | Medium | Log retrieval, entity filtering |

### 5.3 Database Integration

Tests requiring database access use a **test database**:

```
DATABASE_URL=postgresql://test:test@localhost:5432/educhain_test
```

**Strategy:**
- Prisma migrations applied before test suite
- Each test suite wraps in a transaction (rolled back after)
- OR: truncate tables between test suites

---

## 6. End-to-End Tests

### 6.1 Web (Playwright)

Critical user flows tested in browser:

| Flow | Steps |
|---|---|
| Student onboarding | Register → Login → Create profile → Add skills |
| Credential verification | Admin issues credential → Public verify link works |
| Search and discovery | Search students → View profile → Follow |
| Recruiter workflow | Login as recruiter → Browse → Shortlist |

### 6.2 Mobile (Detox / Maestro)

| Flow | Steps |
|---|---|
| Login | Google OAuth → Profile loaded |
| Profile management | Update bio → Add skill → View updated profile |
| Notifications | Receive notification → Mark as read |

---

## 7. Security Testing

### 7.1 Authentication Tests

| Test | Assertion |
|---|---|
| Missing token | Returns 401 |
| Expired token | Returns 401 |
| Malformed token | Returns 401 |
| Wrong role | Returns 403 |
| Authenticated student accessing admin route | Returns 403 |
| Student A accessing Student B's private data | Returns 403 or filtered data |

### 7.2 Input Validation Tests

| Test | Assertion |
|---|---|
| SQL injection in search query | Prisma parameterizes — no injection |
| XSS in bio/description fields | Stored as-is, output is JSON (no HTML rendering) |
| Oversized request body | Returns 413 or 400 |
| Invalid UUID in params | Returns 400 |
| Missing required fields | Returns 400 with validation message |

### 7.3 Rate Limiting Tests

| Test | Assertion |
|---|---|
| Exceed global limit (300/min) | Returns 429 |
| Exceed search limit | Returns 429 |
| Recovery after window | Requests succeed again |

### 7.4 Credential Integrity Tests

| Test | Assertion |
|---|---|
| Verify authentic credential | Returns verified: true |
| Verify revoked credential | Returns status: revoked |
| Tampered credential hash | Returns verified: false |
| Institution without keys | Cannot issue credentials |

---

## 8. Performance Testing

### 8.1 Load Testing (k6)

```javascript
// k6 load test example
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up
    { duration: '3m', target: 50 },   // Sustained
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95th percentile < 500ms
    http_req_failed: ['rate<0.01'],    // Error rate < 1%
  },
};

export default function () {
  http.get('https://api.educhain.com/api/v1/health');
}
```

### 8.2 Performance Targets

| Metric | Target |
|---|---|
| API response time (p50) | < 100ms |
| API response time (p95) | < 500ms |
| API response time (p99) | < 1000ms |
| Search response time (cached) | < 50ms |
| Concurrent users (sustained) | 100+ |
| Error rate under load | < 1% |

### 8.3 Database Performance

| Test | Approach |
|---|---|
| Query performance | Prisma query logging + EXPLAIN ANALYZE |
| Index effectiveness | Monitor slow query logs |
| Connection pool | Load test with concurrent DB operations |

---

## 9. CI Pipeline Integration

### GitHub Actions Test Workflow

```yaml
name: CI
on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: educhain_test
        ports: ['5432:5432']
      redis:
        image: redis:7
        ports: ['6379:6379']

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/educhain_test

      - run: npx turbo run build
      - run: npx turbo run lint
      - run: npx turbo run typecheck
      - run: npx turbo run test -- --ci --coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/educhain_test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-jwt-secret-16ch
          JWT_REFRESH_SECRET: test-refresh-secret
          SUPABASE_JWT_SECRET: test-supabase-jwt
          NODE_ENV: test
```

### Test Gates

| Gate | Threshold | Blocks PR |
|---|---|---|
| Unit tests pass | 100% | Yes |
| Integration tests pass | 100% | Yes |
| Type check | Zero errors | Yes |
| Lint | Zero errors | Yes |
| Coverage (overall) | ≥ 80% | Warning |
| Coverage (critical paths) | ≥ 90% | Yes |

---

## 10. Coverage Targets

| Area | Target | Critical Paths |
|---|---|---|
| `lib/credential.crypto.ts` | 100% | All crypto functions |
| `lib/password.ts` | 100% | Hash + verify |
| `lib/jwt.ts` | 100% | Generate + verify |
| `middleware/authenticateToken.ts` | 95%+ | Token validation, role extraction |
| `middleware/authorizeRole.ts` | 95%+ | Role checking |
| `modules/auth/` | 90%+ | Register, login, refresh |
| `modules/credentials/` | 90%+ | Issue, sign, verify, revoke |
| `modules/verifications/` | 85%+ | Request, review |
| `modules/students/` | 85%+ | CRUD, visibility |
| `packages/validators/` | 90%+ | All Zod schemas |
| Other modules | 80%+ | Core service logic |

---

## 11. Test Data Management

### Factories / Fixtures

```typescript
// test/factories/user.factory.ts
export const createTestUser = (overrides = {}) => ({
  email: `test-${Date.now()}@example.com`,
  password: 'TestP@ssword1',
  role: 'student' as const,
  ...overrides,
});

export const createTestStudent = (overrides = {}) => ({
  fullName: 'Test Student',
  degree: 'B.S. Computer Science',
  graduationYear: 2027,
  ...overrides,
});
```

### Database Seeding

```bash
# Seed development database
npx prisma db seed

# Seed creates:
# - 1 platform_admin
# - 2 institutions (with RSA keys)
# - 5 students (with skills, projects, achievements)
# - 1 recruiter
# - Sample credentials and verifications
```

---

## 12. Test Organization

```
apps/api/src/
├── lib/
│   ├── credential.crypto.test.ts    ← Unit tests
│   ├── jwt.test.ts                  ← Unit tests
│   ├── password.test.ts             ← Unit tests
│   └── search.cache.test.ts         ← Unit tests
├── middleware/
│   └── (middleware tests inline or in __tests__/)
├── modules/
│   ├── auth/
│   │   ├── auth.service.ts
│   │   ├── auth.service.test.ts     ← Unit test
│   │   └── auth.routes.test.ts      ← Integration test
│   ├── credentials/
│   │   ├── credentials.service.test.ts
│   │   └── credentials.routes.test.ts
│   └── ... (same pattern per module)
└── __tests__/
    └── e2e/                         ← E2E tests (if colocated)

packages/validators/src/
├── auth.ts
├── auth.test.ts                     ← Validator unit tests
├── student.ts
├── student.test.ts
└── ...
```

---

## 13. Existing Tests

Tests already implemented in the codebase:

| File | Type | Covers |
|---|---|---|
| `credential.crypto.test.ts` | Unit | RSA key generation, hashing, signing, verification |
| `password.test.ts` | Unit | Argon2id hashing and verification |
| `jwt.test.ts` | Unit | JWT generation and verification |
| `search.cache.test.ts` | Unit | Redis cache get/set/invalidate |

---

## 14. Testing Best Practices

### Do

- Test behavior, not implementation details
- Use descriptive test names: `it('should reject expired tokens with 401')`
- Keep tests independent — no shared mutable state
- Mock external services (Supabase, Redis) in unit tests
- Use real database in integration tests (via Docker in CI)
- Test error paths, not just happy paths
- Test authorization boundaries between roles

### Don't

- Don't test Prisma/Fastify internals
- Don't mock what you can use directly (prefer real DB in integration)
- Don't write tests that depend on execution order
- Don't skip failure cases
- Don't hardcode UUIDs or timestamps — use factories
