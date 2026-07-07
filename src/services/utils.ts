/**
 * Shared service utilities for retries, rate limiting, and environment compatibility
 */

export const getEnvVar = (name: string): string => {
  if (typeof process !== "undefined" && process.env && process.env[name]) {
    return process.env[name] || "";
  }
  if (typeof window !== "undefined" && (import.meta as any).env && (import.meta as any).env[`VITE_${name}`]) {
    return (import.meta as any).env[`VITE_${name}`] || "";
  }
  return "";
};

/**
 * Execute an async operation with retries and exponential backoff
 */
export async function withRetries<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= retries) {
        throw err;
      }
      const backoff = delayMs * Math.pow(2, attempt);
      console.warn(`Attempt ${attempt} failed. Retrying in ${backoff}ms... Error:`, err);
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
  throw new Error("Failed after maximum retries");
}

/**
 * Basic memory-based rate limiter to ensure we don't spam public APIs
 */
const lastRequestTimestamps: Record<string, number> = {};

export async function rateLimit(serviceName: string, minIntervalMs: number = 200): Promise<void> {
  const now = Date.now();
  const last = lastRequestTimestamps[serviceName] || 0;
  const elapsed = now - last;
  if (elapsed < minIntervalMs) {
    const delay = minIntervalMs - elapsed;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  lastRequestTimestamps[serviceName] = Date.now();
}
