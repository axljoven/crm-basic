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
        from: 'Axl Joven <onboarding@resend.dev>',
        to: email,
        subject: 'Got your inquiry — I\'ll be in touch soon',
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#000;">
            <p>Hi ${name},</p>
            <p>Thanks for reaching out. I received your inquiry about <strong>${TYPE_LABELS[inquiry_type] ?? inquiry_type}</strong> and I'll get back to you within a few hours.</p>
            <p><strong>What you sent:</strong></p>
            <blockquote style="border-left:3px solid #0070F3;margin:0;padding:12px 16px;background:#f9f9f9;color:#333;">
              ${message}
            </blockquote>
            ${budget_range ? `<p style="color:#555;font-size:14px;">Budget: ${budget_range}</p>` : ''}
            <p>Talk soon,<br/>Axl</p>
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
