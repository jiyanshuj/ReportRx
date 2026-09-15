import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  datalabApiKey: required('DATALAB_API_KEY'),
  markerApiBaseUrl:
    process.env.MARKER_API_BASE_URL ?? 'https://www.datalab.to/api/v1/marker',
  pollIntervalMs: Number(process.env.POLL_INTERVAL_MS ?? 1500),
  pollTimeoutMs: Number(process.env.POLL_TIMEOUT_MS ?? 120000),
};
