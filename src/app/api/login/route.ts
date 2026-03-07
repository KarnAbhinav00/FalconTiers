import { POST as authLoginPOST } from '@/app/api/auth/login/route'

export const POST = authLoginPOST

export async function GET() {
  return new Response(JSON.stringify({ authenticated: false }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}
