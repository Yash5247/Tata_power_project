export async function logError(err: unknown, context?: Record<string, any>) {
  // Basic serverless-friendly logger. If SENTRY_DSN is configured, you can
  // replace this with Sentry SDK initialization and captureException.
  // Keeping it lightweight to avoid heavy deps.
  console.error('[Error]', err, context || {});
}


