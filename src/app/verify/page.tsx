'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, AlertTriangle, XCircle, Search, RefreshCw, MessageCircle } from 'lucide-react'

type TicketData = {
  id?: string
  ticket_id?: string
  contact_name: string
  brand_name: string
  whatsapp_number: string
  stall_tier: string
  category: string
  hero_dishes: string
  location_area?: string | null
  checked_in?: boolean
  created_at?: string
}

function VerifyContent() {
  const searchParams = useSearchParams()
  const initialId = searchParams.get('id') || ''

  const [searchId, setSearchId] = useState(initialId)
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkinSuccess, setCheckinSuccess] = useState(false)

  const fetchTicket = async (idToFetch: string) => {
    if (!idToFetch.trim()) return
    setLoading(true)
    setError('')
    setCheckinSuccess(false)

    try {
      const res = await fetch(`/api/verify?id=${encodeURIComponent(idToFetch.trim())}`)
      const data = await res.json()

      if (res.ok && data.found && data.ticket) {
        setTicket(data.ticket)
      } else {
        setTicket(null)
        setError(data.error || 'No valid pass found for this ID.')
      }
    } catch {
      setError('Network error checking ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialId) {
      fetchTicket(initialId)
    }
  }, [initialId])

  const handleCheckIn = async () => {
    if (!ticket) return
    setCheckingIn(true)
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: ticket.ticket_id || ticket.id }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setCheckinSuccess(true)
        setTicket(prev => prev ? { ...prev, checked_in: true } : null)
      } else {
        alert(data.error || 'Failed to check in ticket')
      }
    } catch {
      alert('Network error while checking in')
    } finally {
      setCheckingIn(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchTicket(searchId)
  }

  const qrImageUrl = ticket
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
        typeof window !== 'undefined' ? window.location.href : searchId
      )}`
    : ''

  return (
    <div className="max-w-md mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <span className="inline-block px-3 py-1 bg-[#FFD400] text-[#111111] rounded-full text-xs font-black tracking-wider uppercase">
          Gate Scanner &amp; Check-In
        </span>
        <h1 className="text-2xl font-black text-white">City Mela Pass Verification</h1>
        <p className="text-xs text-[#a39b8f]">Little Guwahati Festival &amp; Pet Puja 2026</p>
      </div>

      {/* Manual Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            placeholder="Scan QR or enter Ticket ID (e.g. LGF-...)"
            className="w-full px-4 py-3 rounded-xl bg-[#1d1a17] border border-[#332e29] text-white text-sm focus:outline-none focus:border-[#FFD400]"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 bg-[#FFD400] text-[#111] rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-[#e6bf00]"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Verify</span>
        </button>
      </form>

      {/* Ticket Card Result */}
      {ticket && (
        <div className="bg-[#FFFBF4] text-[#1A0F0C] rounded-2xl border-2 border-[#1A0F0C] p-6 shadow-2xl space-y-5 animate-fadeIn">
          {/* Status Badge */}
          <div className="text-center">
            {ticket.checked_in || checkinSuccess ? (
              <div className="inline-flex items-center gap-2 bg-[#FFF3D6] border border-[#D97706] text-[#9A6700] px-4 py-1.5 rounded-full text-xs font-bold">
                <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                <span>ALREADY CHECKED IN</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-[#DCFCE7] border border-[#16A34A] text-[#166534] px-4 py-1.5 rounded-full text-xs font-black tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>VALID PASS — READY TO ADMIT</span>
              </div>
            )}
          </div>

          {/* QR Code preview */}
          {qrImageUrl && (
            <div className="flex justify-center">
              <div className="p-2.5 bg-white rounded-xl border border-[#EADDD3] shadow-inner">
                <img src={qrImageUrl} alt="Pass QR" width={140} height={140} className="rounded-lg" />
              </div>
            </div>
          )}

          {/* Ticket Details */}
          <div className="text-center space-y-1">
            <span className="font-mono text-xs uppercase tracking-wider text-[#7A1F2B] font-bold">
              {ticket.ticket_id || ticket.id}
            </span>
            <h2 className="text-2xl font-black text-[#1A0F0C]">{ticket.contact_name}</h2>
            <p className="text-sm font-bold text-[#7A1F2B]">{ticket.brand_name}</p>
          </div>

          <div className="border-t border-b border-[#EADDD3] py-3 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#6B5560] font-semibold">Pass Type:</span>
              <span className="font-bold text-[#1A0F0C]">{ticket.stall_tier || ticket.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B5560] font-semibold">Inclusions:</span>
              <span className="font-bold text-[#1A0F0C] max-w-[200px] text-right truncate">
                {ticket.hero_dishes}
              </span>
            </div>
            {ticket.location_area && (
              <div className="flex justify-between">
                <span className="text-[#6B5560] font-semibold">School / City:</span>
                <span className="font-bold text-[#1A0F0C]">{ticket.location_area}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#6B5560] font-semibold">WhatsApp:</span>
              <span className="font-bold text-[#1A0F0C]">+91 {ticket.whatsapp_number}</span>
            </div>
          </div>

          {/* Check-in CTA Button */}
          {ticket.checked_in || checkinSuccess ? (
            <div className="text-center p-3 bg-[#FFF3D6] text-[#9A6700] rounded-xl text-xs font-bold">
              ✓ Attendee has already been checked into the festival.
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="w-full py-4 bg-[#1F9D55] hover:bg-[#188044] text-white font-black text-base rounded-xl shadow-lg transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {checkingIn ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Checking in attendee…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>CHECK IN ATTENDEE NOW</span>
                </>
              )}
            </button>
          )}

          {/* Quick WhatsApp helper */}
          <div className="text-center pt-1">
            <a
              href={`https://wa.me/91${ticket.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#1F9D55] font-bold hover:underline"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message Attendee on WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-[#2A1315] border border-[#FF6B6B]/40 rounded-2xl p-6 text-center space-y-2 text-[#FFBABA]">
          <XCircle className="w-10 h-10 mx-auto text-[#FF6B6B]" />
          <h3 className="font-bold text-base text-white">Invalid Pass Code</h3>
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  )
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#141210] text-white flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="text-white text-center">Loading scanner...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  )
}

