'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  const urlError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError === 'unauthorized'
      ? 'Access restricted: Your account does not have admin privileges.'
      : null
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMessage(error.message || 'Failed to sign in. Please check your credentials.')
        setLoading(false)
        return
      }

      if (data.user) {
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.'
      setErrorMessage(message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-[#1d1a17] border border-[#2a2622] rounded-3xl p-8 shadow-2xl">
      {/* Header */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFD400]/10 text-[#FFD400] mb-2 border border-[#FFD400]/20">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest bg-[#FFD400] text-[#111] px-3 py-1 rounded-full">
            Admin Access
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          City Mela Portal
        </h1>
        <p className="text-xs text-[#a39b8f]">
          Enter your admin credentials to access the organiser dashboard.
        </p>
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="mb-6 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 text-xs leading-relaxed animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#a39b8f] mb-1.5">
            Admin Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#a39b8f] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@citymela.space"
              required
              autoComplete="email"
              className="w-full bg-[#141210] border border-[#2a2622] focus:border-[#FFD400] text-white text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition placeholder:text-[#555047]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#a39b8f] mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-[#a39b8f] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              autoComplete="current-password"
              className="w-full bg-[#141210] border border-[#2a2622] focus:border-[#FFD400] text-white text-sm rounded-xl pl-10 pr-4 py-3 outline-none transition placeholder:text-[#555047]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-[#FFD400] hover:bg-[#e6bf00] disabled:bg-[#FFD400]/50 text-[#111] font-bold text-sm py-3.5 px-4 rounded-xl transition duration-150 shadow-lg cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Sign In to Dashboard
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer info */}
      <div className="mt-8 pt-6 border-t border-[#2a2622] text-center">
        <a
          href="/"
          className="text-xs text-[#a39b8f] hover:text-[#FFD400] transition"
        >
          ← Return to City Mela Homepage
        </a>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen bg-[#141210] text-[#F7ECEF] flex items-center justify-center p-4"
      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
    >
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-[#1d1a17] border border-[#2a2622] rounded-3xl p-8 text-center text-[#a39b8f]">
            Loading login...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}

