const requestMap = new Map<string, { count: number; resetAt: number }>()

interface RateLimitOptions {
  windowMs?: number
  max?: number
}

export function rateLimit(key: string, options: RateLimitOptions = {}): { allowed: boolean; remaining: number; resetAt: number } {
  const { windowMs = 60_000, max = 20 } = options
  const now = Date.now()
  const entry = requestMap.get(key)

  if (!entry || now > entry.resetAt) {
    requestMap.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs }
  }

  entry.count++
  const allowed = entry.count <= max
  return { allowed, remaining: Math.max(0, max - entry.count), resetAt: entry.resetAt }
}

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    requestMap.forEach((val, key) => {
      if (now > val.resetAt) requestMap.delete(key)
    })
  }, 300_000)
}
