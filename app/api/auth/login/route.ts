import { NextRequest, NextResponse } from 'next/server'
import { createSessionToken, sessionCookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ error: 'Admin credentials not configured' }, { status: 500 })
  }

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const token = await createSessionToken(email)
  const res = NextResponse.json({ ok: true })
  res.cookies.set(sessionCookieOptions(token))
  return res
}
