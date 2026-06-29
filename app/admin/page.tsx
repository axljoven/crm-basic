import { getSupabase } from '@/lib/supabase'

const STATUS_COLORS: Record<string, string> = {
  new_lead: 'bg-blue-50 text-blue-700',
  contacted: 'bg-green-50 text-green-700',
  discovery_call: 'bg-purple-50 text-purple-700',
  proposal: 'bg-yellow-50 text-yellow-700',
  won: 'bg-emerald-50 text-emerald-700',
  lost: 'bg-gray-100 text-gray-500',
}

const TYPE_LABELS: Record<string, string> = {
  landing_page_quote: 'Landing Page Quote',
  custom_ui_dev: 'Custom UI + Dev',
  site_upload: 'Site Upload',
  multipage_website_quote: 'Multi-Page Site Quote',
  package_inquiry: 'Package Inquiry',
}

type Contact = {
  id: string
  type: string
  subject: string
  message: string
  status: string
  created_at: string
  people: {
    name: string
    email: string
    phone: string | null
    company: string | null
    attributes: {
      how_we_met?: string | null
      budget_range?: string | null
      follow_up_date?: string | null
    }
  } | null
}

async function getLeads(): Promise<Contact[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('contacts')
    .select(`
      id, type, subject, message, status, created_at,
      people ( name, email, phone, company, attributes )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Failed to fetch leads:', error)
    return []
  }
  return (data ?? []) as unknown as Contact[]
}

export const revalidate = 0

export default async function AdminPage() {
  const leads = await getLeads()

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
              Admin
            </span>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-xs text-gray-400 hover:text-black transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="px-8 py-10">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
              <p className="text-sm text-gray-500 mt-0.5">{leads.length} total · newest first</p>
            </div>
            <a href="/" target="_blank" className="text-xs text-[#0070F3] hover:underline">
              View public site →
            </a>
          </div>

          {leads.length === 0 ? (
            <div className="border border-gray-200 p-16 text-center">
              <p className="text-sm text-gray-400">No leads yet. Submit the contact form to see one here.</p>
            </div>
          ) : (
            <div className="border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 px-5 py-3">Name</th>
                    <th className="text-left text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 px-5 py-3">Email</th>
                    <th className="text-left text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 px-5 py-3">Inquiry type</th>
                    <th className="text-left text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 px-5 py-3">Status</th>
                    <th className="text-left text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 px-5 py-3">Budget</th>
                    <th className="text-left text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 px-5 py-3">How we met</th>
                    <th className="text-left text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 px-5 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => (
                    <tr key={lead.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                      <td className="px-5 py-4 font-semibold whitespace-nowrap">
                        {lead.people?.name ?? '—'}
                        {lead.people?.company && (
                          <div className="text-xs text-gray-400 font-normal">{lead.people.company}</div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{lead.people?.email ?? '—'}</td>
                      <td className="px-5 py-4 whitespace-nowrap">{TYPE_LABELS[lead.type] ?? lead.type}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[lead.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {lead.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                        {lead.people?.attributes?.budget_range ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                        {lead.people?.attributes?.how_we_met ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-400 whitespace-nowrap text-xs">
                        {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Message preview for latest lead */}
              {leads[0] && (
                <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
                  <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400">Latest message</span>
                  <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{leads[0].message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
