interface RateLimitEntry {
  timestamps: number[];
}

const rateLimitMap: Map<string, RateLimitEntry> = new Map();

/**
 * Resets the in-memory rate limiter (useful for test isolation)
 */
export function resetRateLimiter(): void {
  rateLimitMap.clear();
}

/**
 * Sliding window rate limiter.
 * @param key Unique key for the actor (e.g. `userId:checkout` or `ip:export`)
 * @param maxRequests Maximum allowed requests in the time window
 * @param windowSeconds Duration of the window in seconds
 */
export function checkRateLimit(
  key: string,
  maxRequests = 10,
  windowSeconds = 60
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;

  const entry = rateLimitMap.get(key) || { timestamps: [] };

  // Filter timestamps within current window
  const recent = entry.timestamps.filter((ts) => ts > cutoff);

  if (recent.length >= maxRequests) {
    const oldest = recent[0];
    const resetInSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  recent.push(now);
  rateLimitMap.set(key, { timestamps: recent });

  return {
    allowed: true,
    remaining: maxRequests - recent.length,
    resetInSeconds: windowSeconds,
  };
}

/**
 * Validates request payload size using Content-Length header or cloned buffer.
 * Default maximum size: 2 MB (2 * 1024 * 1024 bytes).
 */
export function isRequestSizeWithinLimit(
  request: Request,
  maxSizeBytes = 2 * 1024 * 1024
): boolean {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const bytes = parseInt(contentLength, 10);
    if (!isNaN(bytes) && bytes > maxSizeBytes) {
      return false;
    }
  }
  return true;
}
