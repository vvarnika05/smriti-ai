const submissions = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_SUBMISSIONS = 5;

/**
 * Returns true if the IP is under the limit,
 * false if the IP has exceeded the rate limit.
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = submissions.get(ip);

  if (!entry) {
    submissions.set(ip, { count: 1, firstAt: now });
    return true;
  }

  if (now - entry.firstAt > WINDOW_MS) {
    // Window expired → reset
    submissions.set(ip, { count: 1, firstAt: now });
    return true;
  }

  if (entry.count >= MAX_SUBMISSIONS) {
    return false;
  }

  entry.count++;
  return true;
}
