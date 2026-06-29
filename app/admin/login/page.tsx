'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      router.push('/admin')
      router.refresh()
    } else {
      const json = await res.json().catch(() => ({}))
      setError(json.error ?? 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-xl font-bold tracking-tight">
            CRM<span className="text-[#0070F3]">Basic</span>
          </span>
          <p className="text-sm text-gray-500 mt-1">Admin sign in</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-[0.06em] uppercase text-gray-800">Email</label>
            <input name="email" type="email" required autoComplete="email" className="w-full text-sm border border-gray-200 rounded px-3 py-2.5 outline-none focus:border-[#0070F3] transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold tracking-[0.06em] uppercase text-gray-800">Password</label>
            <input name="password" type="password" required autoComplete="current-password" className="w-full text-sm border border-gray-200 rounded px-3 py-2.5 outline-none focus:border-[#0070F3] transition-colors" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="bg-black text-white text-sm font-bold py-2.5 rounded hover:bg-[#0070F3] transition-colors disabled:opacity-50 mt-1">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
