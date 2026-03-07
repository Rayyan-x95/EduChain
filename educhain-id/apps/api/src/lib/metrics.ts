import { FastifyRequest, FastifyReply } from 'fastify';

// ---------------------------------------------------------------------------
// Prometheus-compatible metrics (text exposition format)
// ---------------------------------------------------------------------------

interface HistogramBucket {
  le: number;
  count: number;
}

const counters: Record<string, number> = {
  http_requests_total: 0,
  http_errors_total: 0,
  http_5xx_errors_total: 0,
  http_requests_within_slo_total: 0,
  cache_hits_total: 0,
  cache_misses_total: 0,
  queue_jobs_processed_total: 0,
  queue_jobs_failed_total: 0,
  credential_verifications_total: 0,
  credential_issuances_total: 0,
};

const gauges: Record<string, number> = {
  active_connections: 0,
};

// Request duration histogram (ms)
const durationBuckets: HistogramBucket[] = [
  { le: 10, count: 0 },
  { le: 25, count: 0 },
  { le: 50, count: 0 },
  { le: 100, count: 0 },
  { le: 250, count: 0 },
  { le: 500, count: 0 },
  { le: 1000, count: 0 },
  { le: 2500, count: 0 },
  { le: 5000, count: 0 },
];
let durationSum = 0;
let durationCount = 0;

// Per-route request counters: map of "METHOD /path" → count
const routeCounters = new Map<string, number>();
const routeErrorCounters = new Map<string, number>();

export function incrementCounter(name: keyof typeof counters, amount = 1): void {
  if (name in counters) counters[name] += amount;
}

export function setGauge(name: keyof typeof gauges, value: number): void {
  if (name in gauges) gauges[name] = value;
}

export function recordDuration(ms: number): void {
  for (const bucket of durationBuckets) {
    if (ms <= bucket.le) bucket.count++;
  }
  durationSum += ms;
  durationCount++;
}

// Backward-compatible aliases
export function incrementRequests(): void { incrementCounter('http_requests_total'); }
export function incrementErrors(): void { incrementCounter('http_errors_total'); }
export function incrementCacheHits(): void { incrementCounter('cache_hits_total'); }
export function incrementCacheMisses(): void { incrementCounter('cache_misses_total'); }
export function incrementQueueJobs(status: 'processed' | 'failed'): void {
  incrementCounter(status === 'processed' ? 'queue_jobs_processed_total' : 'queue_jobs_failed_total');
}

/**
 * Return metrics as JSON (for /metrics JSON consumers).
 */
export function getMetrics(): Record<string, unknown> {
  return {
    ...counters,
    ...gauges,
    request_duration_sum_ms: durationSum,
    request_duration_count: durationCount,
  };
}

/**
 * Return metrics in Prometheus text exposition format.
 */
export function getPrometheusMetrics(): string {
  const lines: string[] = [];

  // Counters
  for (const [name, value] of Object.entries(counters)) {
    lines.push(`# TYPE ${name} counter`);
    lines.push(`${name} ${value}`);
  }

  // Gauges
  for (const [name, value] of Object.entries(gauges)) {
    lines.push(`# TYPE ${name} gauge`);
    lines.push(`${name} ${value}`);
  }

  // Request duration histogram
  lines.push('# TYPE http_request_duration_ms histogram');
  for (const bucket of durationBuckets) {
    lines.push(`http_request_duration_ms_bucket{le="${bucket.le}"} ${bucket.count}`);
  }
  lines.push(`http_request_duration_ms_bucket{le="+Inf"} ${durationCount}`);
  lines.push(`http_request_duration_ms_sum ${durationSum}`);
  lines.push(`http_request_duration_ms_count ${durationCount}`);

  // Per-route counters
  if (routeCounters.size > 0) {
    lines.push('# TYPE http_route_requests_total counter');
    for (const [route, count] of routeCounters) {
      lines.push(`http_route_requests_total{route="${route}"} ${count}`);
    }
  }

  if (routeErrorCounters.size > 0) {
    lines.push('# TYPE http_route_errors_total counter');
    for (const [route, count] of routeErrorCounters) {
      lines.push(`http_route_errors_total{route="${route}"} ${count}`);
    }
  }

  return lines.join('\n') + '\n';
}

/**
 * Fastify onResponse hook for request counting and latency tracking.
 */
export async function metricsHook(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  incrementCounter('http_requests_total');

  // Track per-route stats
  const routeKey = `${request.method} ${request.routeOptions?.url ?? request.url}`;
  routeCounters.set(routeKey, (routeCounters.get(routeKey) ?? 0) + 1);

  if (reply.statusCode >= 400) {
    incrementCounter('http_errors_total');
    routeErrorCounters.set(routeKey, (routeErrorCounters.get(routeKey) ?? 0) + 1);
  }

  // SLI: track 5xx errors separately for availability calculation
  if (reply.statusCode >= 500) {
    incrementCounter('http_5xx_errors_total');
  }

  // Record request duration if the request start time is available
  const elapsed = reply.elapsedTime;
  if (typeof elapsed === 'number') {
    recordDuration(elapsed);
    // SLI: count requests under latency SLO (< 500ms)
    if (elapsed <= 500) {
      incrementCounter('http_requests_within_slo_total');
    }
  }
}
