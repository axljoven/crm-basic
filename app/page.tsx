'use client'

import { useState } from 'react'

const INQUIRY_TYPES = [
  { value: 'landing_page_quote', label: 'Single-page landing site — how much does it cost?' },
  { value: 'custom_ui_dev', label: 'Custom UI design + frontend development' },
  { value: 'site_upload', label: 'Site uploading / deployment help' },
  { value: 'multipage_website_quote', label: 'Multi-page business site — pricing and what\'s included' },
  { value: 'package_inquiry', label: 'Not sure — I\'d like to talk through options' },
]

const BUDGET_RANGES = [
  'Under $500',
  '$500 – $2,000',
  '$2,000 – $5,000',
  '$5,000 – $10,000',
  '$10,000+',
]

export default function Home() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      company: (form.elements.namedItem('company') as HTMLInputElement).value,
      inquiry_type: (form.elements.namedItem('inquiry_type') as HTMLSelectElement).value,
      budget_range: (form.elements.namedItem('budget_range') as HTMLSelectElement).value,
      how_we_met: (form.elements.namedItem('how_we_met') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
      ok_to_contact: (form.elements.namedItem('ok_to_contact') as HTMLInputElement).checked,
    }

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      setSubmitted(true)
    } else {
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-8">
        <div className="max-w-[880px] mx-auto flex items-center justify-between h-14">
          <span className="text-[15px] font-bold tracking-tight">
            CRM<span className="text-[#0070F3]">Basic</span>
          </span>
          <div className="flex gap-7 items-center">
            <a href="#services" className="text-sm text-gray-500 hover:text-black transition-colors">Services</a>
            <a href="#how-it-works" className="text-sm text-gray-500 hover:text-black transition-colors">How it works</a>
            <a href="#contact" className="text-[13px] font-semibold bg-black text-white px-4 py-2 rounded hover:bg-[#0070F3] transition-colors">
              Get in touch
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="border-b border-gray-200 px-8 py-24">
        <div className="max-w-[880px] mx-auto">
          <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#0070F3] block mb-5">
            Frontend Development
          </span>
          <h1 className="text-5xl font-bold tracking-tight leading-[1.1] max-w-[640px] mb-6">
            Sites that look sharp and ship on time.
          </h1>
          <p className="text-lg text-gray-500 max-w-[540px] mb-10 leading-relaxed">
            I build landing pages, multi-page sites, and custom UI. Fill out the form and I&apos;ll reply the same day.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a href="#contact" className="inline-block bg-black text-white text-sm font-semibold px-6 py-3 rounded hover:bg-[#0070F3] transition-colors">
              Send an inquiry
            </a>
            <a href="#services" className="inline-block bg-white text-black text-sm font-medium px-6 py-3 rounded border border-gray-200 hover:border-black transition-colors">
              See what I build
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="border-b border-gray-200 px-8 py-20">
        <div className="max-w-[880px] mx-auto">
          <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#0070F3] mb-3">What I build</div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Pick what you need.</h2>
          <p className="text-base text-gray-500 mb-12">Five types of work. You&apos;ll know what&apos;s included before we start.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
            {[
              { title: 'Single-Page Landing Site', desc: 'One page, one goal. Good for products, offers, and events. Loads fast.' },
              { title: 'Multi-Page Business Site', desc: 'Home, about, services, contact — same design on every page.' },
              { title: 'Custom UI + Frontend Dev', desc: 'Bring your designs and I\'ll build them. Or I start from a blank file — either way, the code ships.' },
              { title: 'Site Uploading & Deployment', desc: 'Already have a site? I\'ll put it online — hosted, domain connected, done.' },
              { title: 'Package Inquiry', desc: 'Not sure which one you need? Tell me what you\'re building and I\'ll send a scope and price.' },
            ].map((s) => (
              <div key={s.title} className="bg-white p-7">
                <div className="w-8 h-8 bg-black rounded mb-4" />
                <h3 className="text-[15px] font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-b border-gray-200 px-8 py-20">
        <div className="max-w-[880px] mx-auto">
          <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#0070F3] mb-3">Process</div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">How it works.</h2>
          <p className="text-base text-gray-500 mb-12">Three steps. No back-and-forth that drags on for weeks.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {[
              { num: '01', title: 'You send an inquiry', desc: 'Fill out the form. What you need, your budget, your deadline. Two minutes.' },
              { num: '02', title: 'I follow up same day', desc: 'I see every submission. I\'ll reply with a scope and timeline — usually within a few hours.' },
              { num: '03', title: 'We build it', desc: 'When we agree on scope, I build it. You get a live site, no babysitting needed.' },
            ].map((s) => (
              <div key={s.num}>
                <div className="text-[40px] font-bold text-gray-200 leading-none mb-3">{s.num}</div>
                <h3 className="text-base font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section id="contact" className="px-8 py-20 bg-gray-50">
        <div className="max-w-[880px] mx-auto">
          <div className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#0070F3] mb-3">Get in touch</div>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Send an inquiry.</h2>
          <p className="text-base text-gray-500 mb-10">Fill in the details below. I read every submission and reply the same day.</p>

          {submitted ? (
            <div className="bg-white border border-gray-200 p-10 text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Inquiry received.</h3>
              <p className="text-sm text-gray-500">Got it. I&apos;ll reply to your email within a few hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Full name" required>
                <input name="name" type="text" placeholder="Maria Santos" required className={inputCls} />
              </Field>
              <Field label="Email address" required>
                <input name="email" type="email" placeholder="maria@example.com" required className={inputCls} />
              </Field>
              <Field label="Phone number">
                <input name="phone" type="tel" placeholder="+63 912 345 6789" className={inputCls} />
              </Field>
              <Field label="Company / Organization">
                <input name="company" type="text" placeholder="Acme Corp" className={inputCls} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="What are you inquiring about?" required>
                  <select name="inquiry_type" required defaultValue="" className={inputCls}>
                    <option value="" disabled>Select an inquiry type</option>
                    {INQUIRY_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Budget range">
                <select name="budget_range" defaultValue="" className={inputCls}>
                  <option value="" disabled>Select a range</option>
                  {BUDGET_RANGES.map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <Field label="How did you hear about me?">
                <input name="how_we_met" type="text" placeholder="Referral, LinkedIn, Google…" className={inputCls} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Tell me about your project" required>
                  <textarea name="message" placeholder="What are you building? What do you already have? When do you need it?" required rows={5} className={inputCls + ' resize-y'} />
                </Field>
              </div>
              <div className="sm:col-span-2 flex items-start gap-3">
                <input name="ok_to_contact" id="ok_to_contact" type="checkbox" className="mt-1 w-4 h-4 accent-[#0070F3]" />
                <label htmlFor="ok_to_contact" className="text-sm text-gray-500 cursor-pointer">
                  I&apos;m okay with receiving occasional updates and follow-ups by email.
                </label>
              </div>
              {error && (
                <div className="sm:col-span-2 text-sm text-red-600">{error}</div>
              )}
              <div className="sm:col-span-2">
                <button type="submit" disabled={loading} className="bg-black text-white text-sm font-bold px-8 py-3 rounded hover:bg-[#0070F3] transition-colors disabled:opacity-50">
                  {loading ? 'Sending…' : 'Send inquiry →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-8 py-10">
        <div className="max-w-[880px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <span className="text-sm font-bold">CRM<span className="text-[#0070F3]">Basic</span></span>
          <span className="text-sm text-gray-400">Frontend dev services · crm-axl.vercel.app</span>
          <span className="text-sm text-gray-400">&copy; 2026 Axl Joven</span>
        </div>
      </footer>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold tracking-[0.06em] uppercase text-gray-800">
        {label}{required && <span className="text-[#0070F3] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full text-sm text-black bg-white border border-gray-200 rounded px-3 py-2.5 outline-none focus:border-[#0070F3] transition-colors'
