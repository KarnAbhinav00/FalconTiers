import type { NextRequest } from 'next/server'

type Bucket = {
  count: number
  resetAt: number
}

const store = globalThis as unknown as { __falconRateLimit?: Map<string, Bucket> }

function getMap() {
  if (!store.__falconRateLimit) store.__falconRateLimit = new Map<string, Bucket>()
  return store.__falconRateLimit
}

export function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

export function rateLimit(req: NextRequest, key: string, max: number, windowMs: number) {
  const now = Date.now()
  const ip = getClientIp(req)
  const bucketKey = `${key}:${ip}`
  const map = getMap()
  const bucket = map.get(bucketKey)

  if (!bucket || now > bucket.resetAt) {
    map.set(bucketKey, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: max - 1, retryAfter: 0 }
  }

  if (bucket.count >= max) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  map.set(bucketKey, bucket)
  return { ok: true, remaining: Math.max(0, max - bucket.count), retryAfter: 0 }
}
