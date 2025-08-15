// @ts-ignore - Temporary ignore for OpenTelemetry types
import { MeterProvider, MetricReader } from '@opentelemetry/sdk-metrics';
// @ts-ignore
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
// @ts-ignore
import { Resource } from '@opentelemetry/resources';
// @ts-ignore
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const metricExporter = new PrometheusExporter({
  port: 9464,
});

const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'entidr',
  }),
});

meterProvider.addMetricReader(metricExporter as unknown as MetricReader);

const meter = meterProvider.getMeter('entidr-meter');

// Métriques principales
export const requestCounter = meter.createCounter('http_requests_total', {
  description: 'Total HTTP requests',
});

export const responseTimeHistogram = meter.createHistogram('http_response_time_seconds', {
  description: 'HTTP response time in seconds',
  unit: 's',
  boundaries: [0.1, 0.5, 1, 2, 5],
});

export const dbQueryCounter = meter.createCounter('db_queries_total', {
  description: 'Total database queries',
});

export const errorCounter = meter.createCounter('errors_total', {
  description: 'Total application errors',
});

export default meter;
