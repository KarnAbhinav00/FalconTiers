import type { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify, type JWTPayload } from 'jose'

const DEV_JWT_FALLBACK = 'falcon-tiers-dev-only-secret-change-me'

function getRawJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (secret && secret.trim().length >= 32) return secret

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is missing or too short. Set a strong value (>=32 chars).')
  }

  return DEV_JWT_FALLBACK
}

export function getJwtSecret() {
  return new TextEncoder().encode(getRawJwtSecret())
}

export async function signAuthToken(user: { userId: number; username: string; role: string }) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getJwtSecret())
}

export async function verifyAuthToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret())
  return payload
}

export function getFallbackAdminCredentials() {
  const username = process.env.ADMIN_USERNAME?.trim()
  const password = process.env.ADMIN_PASSWORD?.trim()
  if (!username || !password) return null

  const lowerUser = username.toLowerCase()
  const disallowed = lowerUser === 'admin' && password === 'admin123'
  if (process.env.NODE_ENV === 'production' && disallowed) {
    return null
  }
  return { username, password }
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

export async function getTokenPayloadFromRequest(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return null

  try {
    return await verifyAuthToken(token)
  } catch {
    return null
  }
}

export async function getAdminPayloadFromRequest(req: NextRequest) {
  const payload = await getTokenPayloadFromRequest(req)
  if (!payload || payload.role !== 'ADMIN') return null
  return payload
}
