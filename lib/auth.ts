const SECRET = process.env.SESSION_SECRET ?? 'fallback-dev-secret'
const COOKIE_NAME = 'admin_session'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function createSessionToken(email: string): Promise<string> {
  const payload = btoa(`${email}:${Date.now()}`)
  const key = await getKey()
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  return `${payload}.${sigHex}`
}

export async function verifySessionToken(token: string): Promise<boolean> {
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [payload, sigHex] = parts
  try {
    const key = await getKey()
    const sigBytes = new Uint8Array(sigHex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)))
    return await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(payload))
  } catch {
    return false
  }
}

export function sessionCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: MAX_AGE,
    path: '/',
  }
}

export { COOKIE_NAME }
