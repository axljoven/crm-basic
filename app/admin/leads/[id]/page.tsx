import { getSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { LeadActions } from './LeadActions'

const TYPE_LABELS: Record<string, string> = {
  landing_page_quote: 'Landing Page Quote',
  custom_ui_dev: 'Custom UI + Frontend Dev',
  site_upload: 'Site Uploading / Deployment',
  multipage_website_quote: 'Multi-Page Business Site Quote',
  package_inquiry: 'Package / Options Inquiry',
}

const STATUS_COLORS: Record<string, string> = {
  new_lead: 'bg-blue-50 text-blue-700',
  contacted: 'bg-green-50 text-green-700',
  discovery_call: 'bg-purple-50 text-purple-700',
  proposal: 'bg-yellow-50 text-yellow-700',
  won: 'bg-emerald-50 text-emerald-700',
  lost: 'bg-gray-100 text-gray-500',
}

const STATUS_LABELS: Record<string, string> = {
  new_lead: 'New lead',
  contacted: 'Contacted',
  discovery_call: 'Discovery call',
  proposal: 'Proposal',
  won: 'Won',
  lost: 'Lost',
}

export const revalidate = 0

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('contacts')
    .select(`id, type, subject, message, source, status, created_at, people ( id, name, email, phone, company, role, source_site, ok_to_contact, attributes, created_at )`)
    .eq('id', params.id)
    .single()

  if (error || !data) notFound()

  const contact = data as unknown as {
    id: string
    type: string
    subject: string
    message: string
    source: string
    status: string
    created_at: string
    people: {
      id: string
      name: string
      email: string
      phone: string | null
      company: string | null
      role: string | null
      source_site: string | null
      ok_to_contact: boolean
      attributes: { how_we_met?: string | null; budget_range?: string | null; follow_up_date?: string | null }
      created_at: string
    } | null
  }

  const person = contact.people

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-8">
        <div className="max-w-[1100px] mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <span className="text-[15px] font-bold tracking-tight">
              CRM<span className="text-[#0070F3]">Basic</span>
            </span>
            <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-400 border-l border-gray-200 pl-4">
              Lead detail
            </span>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-xs text-gray-400 hover:text-black transition-colors">Sign out</button>
          </form>
        </div>
      </header>

      <main className="px-8 py-10 max-w-[1100px] mx-auto">
        {/* Back + title */}
        <div className="mb-8">
          <Link href="/admin" className="text-sm text-[#0070F3] hover:underline">← Back to leads</Link>
          <div className="flex items-center gap-3 mt-4">
            <h1 className="text-2xl font-bold tracking-tight">{person?.name ?? 'Unknown'}</h1>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[contact.status] ?? 'bg-gray-100 text-gray-500'}`}>
              {STATUS_LABELS[contact.status] ?? contact.status}
            </span>
          </div>
          {person?.company && <p className="text-sm text-gray-500 mt-1">{person.company}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: contact info + attributes */}
          <div className="lg:col-span-2 space-y-6">

            {/* Contact info */}
            <div className="border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-3 bg-gray-50">
                <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-400">Contact info</span>
              </div>
              <div className="divide-y divide-gray-100">
                <Row label="Email">
                  <a href={`mailto:${person?.email}`} className="text-[#0070F3] hover:underline">{person?.email ?? '—'}</a>
                </Row>
                <Row label="Phone">{person?.phone ?? '—'}</Row>
                <Row label="Company">{person?.company ?? '—'}</Row>
                <Row label="OK to contact">{person?.ok_to_contact ? 'Yes' : 'No'}</Row>
                <Row label="Source">{person?.source_site ?? '—'}</Row>
                <Row label="Added">{person ? new Date(person.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}</Row>
              </div>
            </div>

            {/* Custom attributes */}
            <div className="border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-3 bg-gray-50">
                <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-400">Details</span>
              </div>
              <div className="divide-y divide-gray-100">
                <Row label="How we met">{person?.attributes?.how_we_met ?? '—'}</Row>
                <Row label="Budget range">{person?.attributes?.budget_range ?? '—'}</Row>
                <Row label="Follow-up date">{person?.attributes?.follow_up_date ?? '—'}</Row>
              </div>
            </div>

            {/* Inquiry */}
            <div className="border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-3 bg-gray-50">
                <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-400">Inquiry</span>
              </div>
              <div className="divide-y divide-gray-100">
                <Row label="Type">{TYPE_LABELS[contact.type] ?? contact.type}</Row>
                <Row label="Submitted">
                  {new Date(contact.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Row>
              </div>
              <div className="px-6 py-5">
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 mb-3">Message</div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{contact.message}</p>
              </div>
            </div>

          </div>

          {/* Right: actions */}
          <div className="space-y-6">
            <LeadActions
              contactId={contact.id}
              inquiryType={contact.type}
              status={contact.status}
              toEmail={person?.email ?? ''}
              toName={person?.name ?? ''}
            />
          </div>

        </div>
      </main>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex px-6 py-3 gap-4">
      <span className="text-xs font-semibold text-gray-400 w-32 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800">{children}</span>
    </div>
  )
}
