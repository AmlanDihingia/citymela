'use client'

import React, { useState, useEffect, use } from 'react'
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Download,
  MessageCircle,
  Share2,
  Clock,
  Sparkles,
  AlertTriangle
} from 'lucide-react'

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

export default function DigitalPassPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const ticketId = resolvedParams.id

  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTicket() {
      try {
        const res = await fetch(`/api/verify?id=${encodeURIComponent(ticketId)}`)
        const data = await res.json()
        if (res.ok && data.found && data.ticket) {
          setTicket(data.ticket)
        } else {
          setError(data.error || 'Ticket not found')
        }
      } catch {
        setError('Network error loading ticket')
      } finally {
        setLoading(false)
      }
    }
    loadTicket()
  }, [ticketId])

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(
    typeof window !== 'undefined' ? `${window.location.origin}/verify?id=${ticketId}` : ticketId
  )}`

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrImageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CityMela-Pass-${ticketId}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      window.open(qrImageUrl, '_blank')
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `City Mela Pass — ${ticket?.contact_name}`,
        text: `Here is my official entry pass for Little Guwahati Festival / City Mela 2026. Pass ID: ${ticketId}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Ticket link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141210] text-[#F7ECEF] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-[#FFD400] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-[#a39b8f]">Loading your digital pass…</p>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#141210] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black">Pass Not Found</h1>
        <p className="text-sm text-[#a39b8f] mt-1 max-w-sm">
          We couldn&apos;t locate pass ID: <span className="font-mono text-[#FFD400]">{ticketId}</span>. Please verify your link or check your confirmation email.
        </p>
        <a
          href="/"
          className="mt-6 px-6 py-2.5 rounded-full bg-[#FFD400] text-black font-bold text-sm"
        >
          Back to Homepage
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141210] text-[#1A0F0C] p-4 sm:p-6 flex flex-col items-center justify-center">
      {/* Wallet Pass Container */}
      <div className="w-full max-w-sm bg-[#FFFBF4] rounded-3xl overflow-hidden shadow-2xl border border-[#2a2622] relative animate-fadeIn">
        {/* Pass Header */}
        <div className="bg-gradient-to-r from-[#B3122A] to-[#870D1F] text-white p-6 text-center relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD400] text-[#111] text-[11px] font-black tracking-widest uppercase mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Official Event Pass</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">Little Guwahati Festival</h1>
          <p className="text-xs text-white/80 mt-0.5">City Mela 2026 • Children’s Day Celebration</p>
        </div>

        {/* Perforated Divider */}
        <div className="relative h-6 bg-[#FFFBF4] flex items-center justify-between px-4">
          <div className="w-6 h-6 rounded-full bg-[#141210] -ml-7 border-r border-[#2a2622]"></div>
          <div className="flex-1 border-b-2 border-dashed border-[#EADDD3] mx-2"></div>
          <div className="w-6 h-6 rounded-full bg-[#141210] -mr-7 border-l border-[#2a2622]"></div>
        </div>

        {/* QR Code Section */}
        <div className="p-6 text-center space-y-4">
          <div className="p-3 bg-white rounded-2xl border-2 border-[#1A0F0C] shadow-md inline-block">
            <img
              src={qrImageUrl}
              alt="Event Pass QR Code"
              width={200}
              height={200}
              className="rounded-xl mx-auto block"
            />
          </div>

          <div>
            <div className="font-mono text-xl font-black tracking-widest text-[#1A0F0C]">
              {ticket.ticket_id || ticket.id}
            </div>
            <div className="text-xs font-semibold text-[#7A1F2B] mt-0.5">
              Show this QR code at the entrance gate
            </div>
          </div>

          {/* Attendee Info Card */}
          <div className="bg-white border border-[#EADDD3] rounded-2xl p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-[#F1E9E3] pb-2">
              <span className="text-[#6B5560] font-semibold">Pass Holder</span>
              <span className="font-bold text-sm text-[#1A0F0C]">{ticket.contact_name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#F1E9E3] pb-2">
              <span className="text-[#6B5560] font-semibold">Pass Type</span>
              <span className="font-bold text-[#B3122A]">{ticket.stall_tier || ticket.category}</span>
            </div>
            <div className="flex justify-between items-start border-b border-[#F1E9E3] pb-2">
              <span className="text-[#6B5560] font-semibold">Includes</span>
              <span className="font-semibold text-right max-w-[180px] text-[#2A1320]">{ticket.hero_dishes}</span>
            </div>
            {ticket.location_area && (
              <div className="flex justify-between items-center">
                <span className="text-[#6B5560] font-semibold">School / City</span>
                <span className="font-semibold text-[#2A1320]">{ticket.location_area}</span>
              </div>
            )}
          </div>

          {/* Event Details Box */}
          <div className="bg-[#FFF3D6] border border-[#FFD400] rounded-xl p-3 text-xs space-y-1.5 text-left text-[#1A0F0C]">
            <div className="flex items-center gap-2 font-bold text-[#8C5E00]">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>14–15 November 2026 (11 AM – 9 PM)</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-[#8C5E00]">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>Brahmaputra Riverfront, Guwahati</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={handleDownloadQR}
              className="w-full py-3 px-3 bg-[#1A0F0C] hover:bg-[#332e29] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow"
            >
              <Download className="w-4 h-4" />
              <span>Save to Phone</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="w-full py-3 px-3 bg-[#FFD400] hover:bg-[#e6bf00] text-[#111] rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer shadow"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Pass</span>
            </button>
          </div>

          {/* WhatsApp Help */}
          <div className="pt-1">
            <a
              href={`https://wa.me/919181051445?text=${encodeURIComponent(
                `Hi Pet Puja Team, I have a question regarding my pass ${ticket.ticket_id || ticket.id}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#1F9D55] font-bold hover:underline"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Have questions? WhatsApp Helpdesk</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

