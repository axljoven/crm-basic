import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { contact_id, to_email, to_name, subject, message } = await req.json()

  if (!contact_id || !to_email || !subject || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Send email via Resend
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error: emailError } = await resend.emails.send({
      from: `Axl Joven <onboarding@resend.dev>`,
      to: to_email,
      replyTo: process.env.ADMIN_EMAIL,
      subject,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#000;line-height:1.6;">
          <p>Hi ${to_name ?? to_email},</p>
          ${message.split('\n').map((line: string) => `<p style="margin:0 0 12px;">${line}</p>`).join('')}
          <p>— Axl</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
          <p style="font-size:12px;color:#aaa;">crm-axl.vercel.app</p>
        </div>
      `,
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
  }

  // Update status to contacted
  const supabase = getSupabase()
  const { error: updateError } = await supabase
    .from('contacts')
    .update({ status: 'contacted' })
    .eq('id', contact_id)

  if (updateError) {
    console.error('Status update error:', updateError)
    return NextResponse.json({ error: 'Email sent but status update failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
