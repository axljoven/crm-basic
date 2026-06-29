'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TYPE_LABELS: Record<string, string> = {
  landing_page_quote: 'Landing Page',
  custom_ui_dev: 'Custom UI + Dev',
  site_upload: 'Site Upload',
  multipage_website_quote: 'Multi-Page Site',
  package_inquiry: 'Package Inquiry',
}

const STATUS_LABELS: Record<string, string> = {
  contacted: 'Contacted',
  discovery_call: 'Discovery call',
  proposal: 'Proposal',
  won: 'Won',
  lost: 'Lost',
}

const NEXT_STATUSES = ['contacted', 'discovery_call', 'proposal', 'won', 'lost']

type Props = {
  contactId: string
  inquiryType: string
  status: string
  toEmail: string
  toName: string
}

export function LeadActions({ contactId, inquiryType, status, toEmail, toName }: Props) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState(status)
  const [updating, setUpdating] = useState(false)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [subject, setSubject] = useState(`Re: Your inquiry about ${TYPE_LABELS[inquiryType] ?? inquiryType}`)
  const [emailBody, setEmailBody] = useState(`Hi ${toName ?? 'there'},\n\nThanks for reaching out. I'd love to learn more about your project.\n\nWhen are you available for a quick call?\n\nAxl`)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  async function updateStatus(newStatus: string) {
    setUpdating(true)
    const res = await fetch('/api/admin/update-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_id: contactId, status: newStatus }),
    })
    if (res.ok) {
      setCurrentStatus(newStatus)
      router.refresh()
    }
    setUpdating(false)
  }

  async function sendEmail() {
    setSending(true)
    setSendError('')
    const res = await fetch('/api/admin/contact-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_id: contactId, to_email: toEmail, to_name: toName, subject, message: emailBody }),
    })
    if (res.ok) {
      setCurrentStatus('contacted')
      setModalOpen(false)
      router.refresh()
    } else {
      const json = await res.json().catch(() => ({}))
      setSendError(json.error ?? 'Failed to send. Try again.')
    }
    setSending(false)
  }

  return (
    <>
      <div className="border border-gray-200 p-6">
        <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-gray-400 mb-4">Actions</div>

        {currentStatus === 'new_lead' ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full bg-black text-white text-sm font-semibold py-2.5 rounded hover:bg-[#0070F3] transition-colors"
            >
              Contact this lead
            </button>
            <button
              onClick={() => updateStatus('lost')}
              disabled={updating}
              className="w-full border border-gray-200 text-gray-500 text-sm font-medium py-2.5 rounded hover:border-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40"
            >
              Mark as lost
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold tracking-[0.06em] uppercase text-gray-600">Move to stage</label>
            <select
              value={currentStatus}
              disabled={updating}
              onChange={e => updateStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded px-3 py-2.5 outline-none focus:border-[#0070F3] bg-white disabled:opacity-40"
            >
              {NEXT_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Contact modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-base">Contact {toName}</div>
                <div className="text-xs text-gray-400 mt-0.5">{toEmail}</div>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black text-xl leading-none">×</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold tracking-[0.06em] uppercase text-gray-600">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="text-sm border border-gray-200 rounded px-3 py-2 outline-none focus:border-[#0070F3]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold tracking-[0.06em] uppercase text-gray-600">Message</label>
                <textarea
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  rows={8}
                  className="text-sm border border-gray-200 rounded px-3 py-2 outline-none focus:border-[#0070F3] resize-y font-mono"
                />
              </div>
              {sendError && <p className="text-sm text-red-600">{sendError}</p>}
            </div>
            <div className="border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
              <button onClick={() => setModalOpen(false)} className="text-sm text-gray-500 hover:text-black px-4 py-2">Cancel</button>
              <button
                onClick={sendEmail}
                disabled={sending || !subject.trim() || !emailBody.trim()}
                className="text-sm font-semibold bg-black text-white px-5 py-2 rounded hover:bg-[#0070F3] transition-colors disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Send email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
