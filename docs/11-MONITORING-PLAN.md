# Monitoring Plan — EduLink

> Observability across application, infrastructure, and security layers  
> Stack: Prometheus + Grafana + Loki + Alertmanager

---

## 1. Observability Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA SOURCES                                   │
│                                                                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │ FastAPI   │  │ PostgreSQL│  │   Redis   │  │   Nginx   │               │
│  │ (metrics  │  │ (pg_stat  │  │ (INFO cmd)│  │ (access   │               │
│  │  endpoint)│  │  exporter)│  │           │  │  logs)    │               │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘               │
│        │              │              │              │                        │
│        ▼              ▼              ▼              ▼                        │
│  ┌──────────────────────────────────────────────────────────┐              │
│  │                    Prometheus                             │              │
│  │              (Metrics Scraping — 15s)                     │              │
│  └─────────────────────────┬────────────────────────────────┘              │
│                            │                                                │
│        ┌───────────────────┼───────────────────┐                           │
│        ▼                   ▼                   ▼                           │
│  ┌───────────┐     ┌────────────┐      ┌─────────────┐                    │
│  │  Grafana  │     │Alertmanager│      │     Loki    │                     │
│  │(Dashboards│     │ (PagerDuty │      │  (Log Agg.) │                      │
│  │ + Explore)│     │  Slack     │      │             │                     │
│  │           │     │  Email)    │      │             │                     │
│  └───────────┘     └────────────┘      └─────────────┘                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Application Metrics (FastAPI)

### Custom Prometheus Metrics

```python
# app/core/metrics.py

from prometheus_client import Counter, Histogram, Gauge, Info

# ── Request Metrics ──────────────────────────────────────
REQUEST_COUNT = Counter(
    "edulink_http_requests_total",
    "Total HTTP requests",
    ["method", "endpoint", "status_code"]
)

REQUEST_LATENCY = Histogram(
    "edulink_http_request_duration_seconds",
    "HTTP request latency in seconds",
    ["method", "endpoint"],
    buckets=[0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0]
)

# ── Auth Metrics ─────────────────────────────────────────
LOGIN_ATTEMPTS = Counter(
    "edulink_login_attempts_total",
    "Login attempts",
    ["status"]  # success, failed, locked
)

ACTIVE_SESSIONS = Gauge(
    "edulink_active_sessions",
    "Current active JWT sessions estimate"
)

# ── Verification Metrics ─────────────────────────────────
QR_GENERATED = Counter(
    "edulink_qr_tokens_generated_total",
    "QR tokens generated",
    ["institution_id"]
)

QR_VALIDATED = Counter(
    "edulink_qr_validations_total",
    "QR validation attempts",
    ["result"]  # valid, expired, replay, invalid, forged
)

CREDENTIAL_VERIFICATIONS = Counter(
    "edulink_credential_verifications_total",
    "Credential verification attempts",
    ["result"]  # valid, invalid, revoked, expired
)

# ── Business Metrics ──────────────────────────────────────
CREDENTIALS_ISSUED = Counter(
    "edulink_credentials_issued_total",
    "Credentials issued",
    ["category", "institution_id"]
)

STUDENTS_REGISTERED = Counter(
    "edulink_students_registered_total",
    "Student registrations",
    ["institution_id"]
)

STUDENTS_VERIFIED = Counter(
    "edulink_students_verified_total",
    "Students verified by institution",
    ["institution_id"]
)

ENDORSEMENTS_GIVEN = Counter(
    "edulink_endorsements_total",
    "Endorsements given",
    ["institution_id"]
)

# ── System Health ─────────────────────────────────────────
DB_POOL_SIZE = Gauge(
    "edulink_db_pool_active_connections",
    "Active database connections"
)

BACKGROUND_TASKS_QUEUE = Gauge(
    "edulink_background_tasks_queued",
    "Background tasks in queue"
)

APP_INFO = Info(
    "edulink_app",
    "Application information"
)
```

### Metrics Middleware

```python
# app/middleware/metrics_middleware.py

import time
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.metrics import REQUEST_COUNT, REQUEST_LATENCY


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start_time = time.perf_counter()
        
        response = await call_next(request)
        
        duration = time.perf_counter() - start_time
        endpoint = request.url.path
        method = request.method
        status = response.status_code
        
        REQUEST_COUNT.labels(
            method=method, endpoint=endpoint, status_code=status
        ).inc()
        
        REQUEST_LATENCY.labels(
            method=method, endpoint=endpoint
        ).observe(duration)
        
        return response
```

---

## 3. Grafana Dashboards

### Dashboard 1: API Overview

| Panel | Type | Query |
|---|---|---|
| Request Rate | Time Series | `rate(edulink_http_requests_total[5m])` |
| Error Rate (%) | Stat | `rate(edulink_http_requests_total{status_code=~"5.."}[5m]) / rate(edulink_http_requests_total[5m]) * 100` |
| P50 Latency | Time Series | `histogram_quantile(0.5, rate(edulink_http_request_duration_seconds_bucket[5m]))` |
| P95 Latency | Time Series | `histogram_quantile(0.95, rate(edulink_http_request_duration_seconds_bucket[5m]))` |
| P99 Latency | Time Series | `histogram_quantile(0.99, rate(edulink_http_request_duration_seconds_bucket[5m]))` |
| Active Connections | Gauge | `edulink_db_pool_active_connections` |
| Top Endpoints | Table | `topk(10, sum by (endpoint) (rate(edulink_http_requests_total[5m])))` |

### Dashboard 2: Verification Activity

| Panel | Type | Query |
|---|---|---|
| QR Tokens Generated/hr | Stat | `increase(edulink_qr_tokens_generated_total[1h])` |
| QR Validation Results | Pie | `sum by (result) (edulink_qr_validations_total)` |
| Credential Verifications | Time Series | `rate(edulink_credential_verifications_total[5m])` |
| Replay Attempts | Stat + Alert | `increase(edulink_qr_validations_total{result="replay"}[1h])` |

### Dashboard 3: Business Metrics

| Panel | Type | Query |
|---|---|---|
| Students Registered (30d) | Stat | `increase(edulink_students_registered_total[30d])` |
| Students Verified (30d) | Stat | `increase(edulink_students_verified_total[30d])` |
| Credentials Issued (30d) | Stat | `increase(edulink_credentials_issued_total[30d])` |
| Endorsements (7d) | Stat | `increase(edulink_endorsements_total[7d])` |
| Registration by Institution | Bar | `sum by (institution_id) (edulink_students_registered_total)` |
| Credential by Category | Pie | `sum by (category) (edulink_credentials_issued_total)` |

### Dashboard 4: Security

| Panel | Type | Query |
|---|---|---|
| Failed Logins (1h) | Stat + Alert | `increase(edulink_login_attempts_total{status="failed"}[1h])` |
| Account Lockouts | Stat | `increase(edulink_login_attempts_total{status="locked"}[1h])` |
| QR Replay Attacks | Stat + Alert | `increase(edulink_qr_validations_total{result="replay"}[1h])` |
| Rate Limit Hits | Time Series | `rate(edulink_http_requests_total{status_code="429"}[5m])` |
| Key Rotation Events | Log panel | Loki query on audit logs |

---

## 4. Alerting Rules

```yaml
# prometheus/alerts.yml

groups:
  - name: edulink-critical
    rules:
      # ── High Error Rate ──────────────────────────
      - alert: HighErrorRate
        expr: |
          rate(edulink_http_requests_total{status_code=~"5.."}[5m])
          / rate(edulink_http_requests_total[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Error rate above 1% for 5 minutes"
          description: "{{ $value | humanizePercentage }} of requests returning 5xx"

      # ── High Latency ────────────────────────────
      - alert: HighP95Latency
        expr: |
          histogram_quantile(0.95,
            rate(edulink_http_request_duration_seconds_bucket[5m])
          ) > 0.5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "P95 latency above 500ms for 10 minutes"

      # ── API Down ─────────────────────────────────
      - alert: APIDown
        expr: up{job="edulink-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "EduLink API instance is down"

      # ── Database Connection Exhaustion ───────────
      - alert: DBConnectionPoolHigh
        expr: edulink_db_pool_active_connections > 18
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Database connection pool near capacity ({{ $value }}/20)"

  - name: edulink-security
    rules:
      # ── Brute Force Detection ────────────────────
      - alert: BruteForceAttempt
        expr: increase(edulink_login_attempts_total{status="failed"}[15m]) > 20
        labels:
          severity: critical
        annotations:
          summary: "Possible brute force: {{ $value }} failed logins in 15 minutes"

      # ── QR Replay Attack ─────────────────────────
      - alert: QRReplayDetected
        expr: increase(edulink_qr_validations_total{result="replay"}[1h]) > 5
        labels:
          severity: critical
        annotations:
          summary: "QR replay attacks detected: {{ $value }} in 1 hour"

      # ── Unusual Credential Issuance ──────────────
      - alert: UnusualCredentialVolume
        expr: increase(edulink_credentials_issued_total[1h]) > 100
        labels:
          severity: warning
        annotations:
          summary: "Unusual credential issuance volume: {{ $value }} in 1 hour"

  - name: edulink-infrastructure
    rules:
      # ── Redis Down ───────────────────────────────
      - alert: RedisDown
        expr: redis_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis instance is down"

      # ── PostgreSQL Replication Lag ───────────────
      - alert: PostgresReplicationLag
        expr: pg_replication_lag_seconds > 30
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL replication lag: {{ $value }}s"

      # ── Disk Space ──────────────────────────────
      - alert: DiskSpaceLow
        expr: node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} < 0.15
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Disk space below 15%"
```

---

## 5. Structured Logging (Loki)

### Log Format

```json
{
  "timestamp": "2026-02-20T10:00:00.123Z",
  "level": "INFO",
  "logger": "edulink.api.v1.credentials",
  "request_id": "req_abc123def456",
  "trace_id": "trace_xyz789",
  "message": "Credential issued successfully",
  "context": {
    "user_id": "550e8400-...",
    "institution_id": "660e8400-...",
    "action": "CREDENTIAL_ISSUED",
    "target_type": "credential",
    "target_id": "770e8400-...",
    "duration_ms": 145
  },
  "request": {
    "method": "POST",
    "path": "/api/v1/credentials",
    "status_code": 201,
    "client_ip": "203.0.113.42",
    "user_agent": "EduLink-Admin/1.0"
  }
}
```

### Key Log Queries (Loki/LogQL)

```logql
# All errors in the last hour
{app="edulink-api"} |= "ERROR" | json | line_format "{{.message}}"

# Failed login attempts
{app="edulink-api"} | json | action="USER_LOGIN_FAILED"

# Credential operations by institution
{app="edulink-api"} | json | action=~"CREDENTIAL_.*" | institution_id="660e8400-..."

# QR replay attempts
{app="edulink-api"} | json | action="QR_VERIFICATION_FAILED" |= "REPLAY"

# Slow requests (>1s)
{app="edulink-api"} | json | duration_ms > 1000

# Key management operations (security-sensitive)
{app="edulink-api"} | json | action=~"KEY_.*"
```

---

## 6. Uptime Monitoring

### Health Check Endpoints

| Endpoint | Check | Frequency |
|---|---|---|
| `GET /api/v1/health` | Application alive | 30s |
| `GET /api/v1/health/ready` | DB + Redis + S3 connectivity | 60s |

### External Monitoring

| Service | What | Alert |
|---|---|---|
| UptimeRobot / Healthchecks.io | `/health` endpoint | Down > 1 min → PagerDuty |
| StatusPage | Public status page | Customer communication |
| Pingdom / Better Uptime | Multi-region checks | Region-specific outages |

---

## 7. Database Monitoring

```sql
-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 slowest queries
SELECT 
    calls,
    round(total_exec_time::numeric, 2) as total_ms,
    round(mean_exec_time::numeric, 2) as avg_ms,
    round(max_exec_time::numeric, 2) as max_ms,
    query
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Connection pool status
SELECT count(*) as active_connections,
       state
FROM pg_stat_activity
WHERE datname = 'edulink'
GROUP BY state;

-- Table sizes
SELECT
    relname as table,
    pg_size_pretty(pg_total_relation_size(relid)) as total_size,
    pg_size_pretty(pg_relation_size(relid)) as data_size,
    n_live_tup as row_count
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

---

## 8. SLA Targets

| Metric | Target | Measurement |
|---|---|---|
| API Availability | 99.9% (8.7h downtime/year) | UptimeRobot |
| API P95 Latency | < 500ms | Prometheus histogram |
| API Error Rate | < 0.1% | Prometheus counter |
| QR Verification Latency | < 300ms | Prometheus histogram |
| Credential Issuance Latency | < 1s | Prometheus histogram |
| Database Query P95 | < 100ms | pg_stat_statements |
| Background Task Completion | < 5 min | ARQ metrics |
