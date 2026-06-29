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
  landing_page_quote: 'Landing Page',
  custom_ui_dev: 'Custom UI + Dev',
  site_upload: 'Site Upload',
  multipage_website_quote: 'Multi-Page Site',
  package_inquiry: 'Package Inquiry',
}

type Contact = {
  id: string
  type: string
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

type Stats = {
  total: number
  new_lead: number
  contacted: number
  discovery_call: number
  proposal: number
  won: number
  lost: number
  by_type: Record<string, number>
  by_budget: Record<string, number>
  this_week: number
}

async function getData(): Promise<{ leads: Contact[]; stats: Stats }> {
  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('contacts')
    .select(`id, type, message, status, created_at, people ( name, email, phone, company, attributes )`)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error || !data) return { leads: [], stats: emptyStats() }

  const leads = data as unknown as Contact[]

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const stats: Stats = emptyStats()
  stats.total = leads.length

  for (const lead of leads) {
    const s = lead.status as keyof Stats
    if (s in stats && typeof stats[s] === 'number') (stats[s] as number)++
    stats.by_type[lead.type] = (stats.by_type[lead.type] ?? 0) + 1
    const budget = lead.people?.attributes?.budget_range
    if (budget) stats.by_budget[budget] = (stats.by_budget[budget] ?? 0) + 1
    if (new Date(lead.created_at) >= weekAgo) stats.this_week++
  }

  return { leads, stats }
}

function emptyStats(): Stats {
  return { total: 0, new_lead: 0, contacted: 0, discovery_call: 0, proposal: 0, won: 0, lost: 0, by_type: {}, by_budget: {}, this_week: 0 }
}

export const revalidate = 0

export default async function AdminPage() {
  const { leads, stats } = await getData()
  const maxType = Math.max(...Object.values(stats.by_type), 1)
  const maxBudget = Math.max(...Object.values(stats.by_budget), 1)

  const pipeline = [
    { key: 'new_lead', label: 'New', color: 'bg-blue-500' },
    { key: 'contacted', label: 'Contacted', color: 'bg-green-500' },
    { key: 'discovery_call', label: 'Discovery', color: 'bg-purple-500' },
    { key: 'proposal', label: 'Proposal', color: 'bg-yellow-500' },
    { key: 'won', label: 'Won', color: 'bg-emerald-500' },
    { key: 'lost', label: 'Lost', color: 'bg-gray-400' },
  ]

  const budgetOrder = ['Under $500', '$500 – $2,000', '$2,000 – $5,000', '$5,000 – $10,000', '$10,000+']

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
              Dashboard
            </span>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-xs text-gray-400 hover:text-black transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="px-8 py-10 max-w-[1100px] mx-auto space-y-10">

        {/* Top stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-200 border border-gray-200">
          {[
            { label: 'Total inquiries', value: stats.total },
            { label: 'This week', value: stats.this_week },
            { label: 'Won', value: stats.won },
            { label: 'New leads', value: stats.new_lead },
          ].map((s) => (
            <div key={s.label} className="bg-white px-6 py-5">
              <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-400 mb-1">{s.label}</div>
              <div className="text-3xl font-bold tracking-tight">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Pipeline + Inquiry types */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Pipeline */}
          <div className="border border-gray-200 p-6">
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-400 mb-5">Pipeline</div>
            <div className="space-y-3">
              {pipeline.map(({ key, label, color }) => {
                const count = (stats as unknown as Record<string, number>)[key] ?? 0
                const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{label}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Inquiry types */}
          <div className="border border-gray-200 p-6">
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-400 mb-5">By type</div>
            <div className="space-y-3">
              {Object.entries(TYPE_LABELS).map(([key, label]) => {
                const count = stats.by_type[key] ?? 0
                const pct = (count / maxType) * 100
                return (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{label}</span>
                      <span className="text-gray-500">{count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0070F3] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* Budget breakdown */}
        <div className="border border-gray-200 p-6">
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-400 mb-5">Budget range</div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {budgetOrder.map((budget) => {
              const count = stats.by_budget[budget] ?? 0
              const pct = Math.round((count / maxBudget) * 100)
              return (
                <div key={budget} className="flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-100 rounded relative" style={{ height: 80 }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-black rounded"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xl font-bold">{count}</div>
                  <div className="text-[11px] text-gray-400 text-center leading-tight">{budget}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Leads table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold tracking-tight">All leads</h2>
            <a href="/" target="_blank" className="text-xs text-[#0070F3] hover:underline">View public site →</a>
          </div>

          {leads.length === 0 ? (
            <div className="border border-gray-200 p-16 text-center">
              <p className="text-sm text-gray-400">No leads yet.</p>
            </div>
          ) : (
            <div className="border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['Name', 'Email', 'Type', 'Status', 'Budget', 'How we met', 'Date'].map(h => (
                      <th key={h} className="text-left text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 font-semibold whitespace-nowrap">
                        {lead.people?.name ?? '—'}
                        {lead.people?.company && <div className="text-xs text-gray-400 font-normal">{lead.people.company}</div>}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{lead.people?.email ?? '—'}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">{TYPE_LABELS[lead.type] ?? lead.type}</td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[lead.status] ?? 'bg-gray-100 text-gray-500'}`}>
                          {lead.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{lead.people?.attributes?.budget_range ?? '—'}</td>
                      <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{lead.people?.attributes?.how_we_met ?? '—'}</td>
                      <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap text-xs">
                        {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
