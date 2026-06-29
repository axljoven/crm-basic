import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

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

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
