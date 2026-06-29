import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { Resend } from 'resend'

const TYPE_LABELS: Record<string, string> = {
  landing_page_quote: 'Single-page landing site',
  custom_ui_dev: 'Custom UI + frontend development',
  site_upload: 'Site uploading / deployment',
  multipage_website_quote: 'Multi-page business site',
  package_inquiry: 'Package / options inquiry',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, company, inquiry_type, budget_range, how_we_met, message, ok_to_contact } = body

    if (!email || !name || !inquiry_type || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = getSupabase()

    // Upsert person by email
    const { data: person, error: personError } = await supabase
      .from('people')
      .upsert(
        {
          email,
          name,
          phone: phone || null,
          company: company || null,
          source_site: 'crm-axl.vercel.app',
          ok_to_contact: ok_to_contact ?? false,
          attributes: {
            how_we_met: how_we_met || null,
            budget_range: budget_range || null,
            follow_up_date: null,
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (personError) {
      console.error('Person upsert error:', personError)
      return NextResponse.json({ error: 'Failed to save contact' }, { status: 500 })
    }

    // Create contact (inquiry)
    const { error: contactError } = await supabase.from('contacts').insert({
      person_id: person.id,
      type: inquiry_type,
      subject: `${inquiry_type} from ${name}`,
      message,
      source: 'contact_form',
      status: 'new_lead',
    })

    if (contactError) {
      console.error('Contact insert error:', contactError)
      return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500 })
    }

    // Send confirmation email (non-blocking — don't fail the form if email fails)
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      resend.emails.send({
        from: 'CRM Basic <onboarding@resend.dev>',
        to: process.env.ADMIN_EMAIL!,
        subject: `New inquiry from ${name} — ${TYPE_LABELS[inquiry_type] ?? inquiry_type}`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#000;">
            <p><strong>New lead from your contact form.</strong></p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px;">
              <tr><td style="padding:6px 0;color:#555;width:120px;">Name</td><td style="padding:6px 0;font-weight:600;">${name}</td></tr>
              <tr><td style="padding:6px 0;color:#555;">Email</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:#0070F3;">${email}</a></td></tr>
              ${phone ? `<tr><td style="padding:6px 0;color:#555;">Phone</td><td style="padding:6px 0;">${phone}</td></tr>` : ''}
              ${company ? `<tr><td style="padding:6px 0;color:#555;">Company</td><td style="padding:6px 0;">${company}</td></tr>` : ''}
              <tr><td style="padding:6px 0;color:#555;">Inquiry</td><td style="padding:6px 0;">${TYPE_LABELS[inquiry_type] ?? inquiry_type}</td></tr>
              ${budget_range ? `<tr><td style="padding:6px 0;color:#555;">Budget</td><td style="padding:6px 0;">${budget_range}</td></tr>` : ''}
              ${how_we_met ? `<tr><td style="padding:6px 0;color:#555;">How we met</td><td style="padding:6px 0;">${how_we_met}</td></tr>` : ''}
            </table>
            <p style="color:#555;font-size:13px;margin-bottom:6px;">Message:</p>
            <blockquote style="border-left:3px solid #0070F3;margin:0;padding:12px 16px;background:#f9f9f9;color:#333;">
              ${message}
            </blockquote>
            <p style="margin-top:20px;"><a href="https://crm-axl.vercel.app/admin" style="background:#000;color:#fff;padding:10px 20px;text-decoration:none;font-size:13px;font-weight:600;">View in admin →</a></p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
            <p style="font-size:12px;color:#aaa;">crm-axl.vercel.app</p>
          </div>
        `,
      }).catch(err => console.error('Resend error:', err))
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
