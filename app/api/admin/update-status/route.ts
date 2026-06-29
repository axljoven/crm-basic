import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase'

const VALID_STATUSES = ['contacted', 'discovery_call', 'proposal', 'won', 'lost']

export async function PATCH(req: NextRequest) {
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { contact_id, status } = await req.json()

  if (!contact_id || !status) {
    return NextResponse.json({ error: 'Missing contact_id or status' }, { status: 400 })
  }

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { error } = await supabase
    .from('contacts')
    .update({ status })
    .eq('id', contact_id)

  if (error) {
    console.error('Status update error:', error)
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
