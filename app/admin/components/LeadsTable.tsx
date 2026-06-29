'use client'

import { useState, useMemo } from 'react'

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

const STATUS_LABELS: Record<string, string> = {
  new_lead: 'New lead',
  contacted: 'Contacted',
  discovery_call: 'Discovery call',
  proposal: 'Proposal',
  won: 'Won',
  lost: 'Lost',
}

type Lead = {
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

type SortCol = 'created_at' | 'name' | 'status' | 'type'
type SortDir = 'asc' | 'desc'

const PER_PAGE_OPTIONS = [5, 10, 20]

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortCol, setSortCol] = useState<SortCol>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [perPage, setPerPage] = useState(10)
  const [page, setPage] = useState(1)

  function handleSort(col: SortCol) {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('desc')
    }
    setPage(1)
  }

  function handleFilter(fn: () => void) {
    fn()
    setPage(1)
  }

  const filtered = useMemo(() => {
    let result = leads

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(l =>
        l.people?.name?.toLowerCase().includes(q) ||
        l.people?.email?.toLowerCase().includes(q) ||
        l.people?.company?.toLowerCase().includes(q)
      )
    }

    if (statusFilter) result = result.filter(l => l.status === statusFilter)
    if (typeFilter) result = result.filter(l => l.type === typeFilter)

    result = [...result].sort((a, b) => {
      let av: string, bv: string
      if (sortCol === 'name') { av = a.people?.name ?? ''; bv = b.people?.name ?? '' }
      else if (sortCol === 'status') { av = a.status; bv = b.status }
      else if (sortCol === 'type') { av = a.type; bv = b.type }
      else { av = a.created_at; bv = b.created_at }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [leads, search, statusFilter, typeFilter, sortCol, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage)

  const pageNumbers = (() => {
    const delta = 2
    const range: number[] = []
    for (let i = Math.max(1, safePage - delta); i <= Math.min(totalPages, safePage + delta); i++) {
      range.push(i)
    }
    return range
  })()

  function SortArrow({ col }: { col: SortCol }) {
    if (sortCol !== col) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-[#0070F3] ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        {/* Search */}
        <input
          type="text"
          placeholder="Search name, email, company…"
          value={search}
          onChange={e => handleFilter(() => setSearch(e.target.value))}
          className="text-sm border border-gray-200 rounded px-3 py-2 outline-none focus:border-[#0070F3] transition-colors w-64"
        />

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => handleFilter(() => setStatusFilter(e.target.value))}
          className="text-sm border border-gray-200 rounded px-3 py-2 outline-none focus:border-[#0070F3] transition-colors bg-white"
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={e => handleFilter(() => setTypeFilter(e.target.value))}
          className="text-sm border border-gray-200 rounded px-3 py-2 outline-none focus:border-[#0070F3] transition-colors bg-white"
        >
          <option value="">All types</option>
          {Object.entries(TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>

        <div className="ml-auto text-sm text-gray-400">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <div className="border border-gray-200 p-16 text-center">
          <p className="text-sm text-gray-400">No leads match your filters.</p>
        </div>
      ) : (
        <div className="border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <Th onClick={() => handleSort('name')} label="Name"><SortArrow col="name" /></Th>
                <Th label="Email" />
                <Th onClick={() => handleSort('type')} label="Type"><SortArrow col="type" /></Th>
                <Th onClick={() => handleSort('status')} label="Status"><SortArrow col="status" /></Th>
                <Th label="Budget" />
                <Th label="How we met" />
                <Th onClick={() => handleSort('created_at')} label="Date"><SortArrow col="created_at" /></Th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((lead) => (
                <tr key={lead.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-semibold whitespace-nowrap">
                    {lead.people?.name ?? '—'}
                    {lead.people?.company && (
                      <div className="text-xs text-gray-400 font-normal">{lead.people.company}</div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">{lead.people?.email ?? '—'}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">{TYPE_LABELS[lead.type] ?? lead.type}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[lead.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {STATUS_LABELS[lead.status] ?? lead.status}
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

      {/* Pagination footer */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        {/* Per-page */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Rows per page:</span>
          {PER_PAGE_OPTIONS.map(n => (
            <button
              key={n}
              onClick={() => { setPerPage(n); setPage(1) }}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${perPage === n ? 'bg-black text-white' : 'hover:bg-gray-100 text-gray-600'}`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          <PageBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>←</PageBtn>
          {pageNumbers[0] > 1 && (
            <>
              <PageBtn onClick={() => setPage(1)}>1</PageBtn>
              {pageNumbers[0] > 2 && <span className="px-1 text-gray-400 text-sm">…</span>}
            </>
          )}
          {pageNumbers.map(n => (
            <PageBtn key={n} onClick={() => setPage(n)} active={n === safePage}>{n}</PageBtn>
          ))}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="px-1 text-gray-400 text-sm">…</span>}
              <PageBtn onClick={() => setPage(totalPages)}>{totalPages}</PageBtn>
            </>
          )}
          <PageBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>→</PageBtn>
        </div>

        <div className="text-sm text-gray-400">
          {(safePage - 1) * perPage + 1}–{Math.min(safePage * perPage, filtered.length)} of {filtered.length}
        </div>
      </div>
    </div>
  )
}

function Th({ label, onClick, children }: { label: string; onClick?: () => void; children?: React.ReactNode }) {
  return (
    <th
      onClick={onClick}
      className={`text-left text-[11px] font-bold tracking-[0.08em] uppercase text-gray-400 px-5 py-3 whitespace-nowrap ${onClick ? 'cursor-pointer hover:text-gray-600 select-none' : ''}`}
    >
      {label}{children}
    </th>
  )
}

function PageBtn({ onClick, disabled, active, children }: { onClick: () => void; disabled?: boolean; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-8 h-8 rounded text-sm font-medium transition-colors
        ${active ? 'bg-black text-white' : ''}
        ${!active && !disabled ? 'hover:bg-gray-100 text-gray-600' : ''}
        ${disabled ? 'text-gray-300 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  )
}
