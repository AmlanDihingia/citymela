'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  MessageCircle,
  Camera,
  CameraOff,
  ArrowLeft,
  Upload,
  Volume2,
  VolumeX,
  Sparkles,
  Phone,
  Calendar,
  Layers
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
  additional_notes?: string | null
}

function playChime(type: 'valid' | 'already' | 'error') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (type === 'valid') {
      // Pleasant high double chime (ready to admit)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1) // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      osc.start()
      osc.stop(ctx.currentTime + 0.35)
    } else if (type === 'already') {
      // Amber warning tone
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(440, ctx.currentTime) // A4
      osc.frequency.setValueAtTime(349.23, ctx.currentTime + 0.15) // F4
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start()
      osc.stop(ctx.currentTime + 0.4)
    } else {
      // Low buzz error
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(220, ctx.currentTime)
      osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.12)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.start()
      osc.stop(ctx.currentTime + 0.3)
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
}

function cleanPassInput(raw: string): string {
  let cleaned = (raw || '').trim()
  if (!cleaned) return ''

  // If full URL scanned or entered
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    try {
      const url = new URL(cleaned)
      const idParam = url.searchParams.get('id')
      if (idParam) return idParam.trim()
      const match = url.pathname.match(/\/pass\/([^/?#]+)/i)
      if (match && match[1]) return decodeURIComponent(match[1]).trim()
    } catch {
      // fallback
    }
  }

  // If query format "?id=LGF-..."
  if (cleaned.includes('id=')) {
    const match = cleaned.match(/[?&]?id=([^&#]+)/i)
    if (match && match[1]) return decodeURIComponent(match[1]).trim()
  }

  return cleaned
}

function VerifyContent() {
  const searchParams = useSearchParams()
  const initialId = searchParams.get('id') || searchParams.get('ticketId') || ''

  const [searchId, setSearchId] = useState(initialId)
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkinSuccess, setCheckinSuccess] = useState(false)

  // Camera scanner states
  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const scanIntervalRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsScanning(false)
  }

  const startCamera = async () => {
    setCameraError('')
    setError('')
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setCameraError('Camera access not supported on this device/browser.')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      mediaStreamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setIsScanning(true)

      // Start detection loop
      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return
          try {
            const codes = await detector.detect(videoRef.current)
            if (codes && codes.length > 0) {
              const rawValue = codes[0].rawValue || codes[0].displayValue
              if (rawValue) {
                const detectedId = cleanPassInput(rawValue)
                if (detectedId) {
                  stopCamera()
                  setSearchId(detectedId)
                  fetchTicket(detectedId)
                }
              }
            }
          } catch {
            // Ignore frame decode glitch
          }
        }, 200)
      } else {
        // BarcodeDetector not natively available in this specific browser
        setCameraError(
          'Live scanner requires modern Chrome/Edge/Safari. You can also upload a QR photo below or search by ID/Phone.'
        )
      }
    } catch (err: any) {
      setCameraError(
        err?.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings.'
          : 'Could not start camera. Please enter pass code manually.'
      )
      setIsScanning(false)
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const fetchTicket = async (idToFetch: string) => {
    const cleaned = cleanPassInput(idToFetch)
    if (!cleaned) return

    setLoading(true)
    setError('')
    setCheckinSuccess(false)

    try {
      const res = await fetch(`/api/verify?id=${encodeURIComponent(cleaned)}`)
      const data = await res.json()

      if (res.ok && data.found && data.ticket) {
        setTicket(data.ticket)
        if (soundEnabled) {
          if (data.ticket.checked_in) {
            playChime('already')
          } else {
            playChime('valid')
          }
        }
      } else {
        setTicket(null)
        setError(data.error || `No valid pass found for "${cleaned}".`)
        if (soundEnabled) playChime('error')
      }
    } catch {
      setError('Network error checking ticket. Please check your connection.')
      if (soundEnabled) playChime('error')
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
      const targetId = ticket.ticket_id || ticket.id
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: targetId }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setCheckinSuccess(true)
        setTicket(prev => (prev ? { ...prev, checked_in: true } : null))
        if (soundEnabled) playChime('valid')
      } else {
        alert(data.error || 'Failed to check in ticket')
        if (soundEnabled) playChime('error')
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

  const handleScanNext = () => {
    setTicket(null)
    setError('')
    setCheckinSuccess(false)
    setSearchId('')
    startCamera()
  }

  // Handle uploaded image file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if ('BarcodeDetector' in window) {
      try {
        const imageBitmap = await createImageBitmap(file)
        const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] })
        const codes = await detector.detect(imageBitmap)
        if (codes && codes.length > 0) {
          const rawValue = codes[0].rawValue || codes[0].displayValue
          const detectedId = cleanPassInput(rawValue)
          if (detectedId) {
            setSearchId(detectedId)
            fetchTicket(detectedId)
            return
          }
        }
        alert('No readable QR code found in this photo. Please try entering the pass code manually.')
      } catch (err) {
        alert('Could not decode QR from image. Please enter pass code manually.')
      }
    } else {
      alert('Photo QR decoding requires modern Chrome/Safari. Please enter the pass code manually.')
    }
  }

  const passIdDisplay = ticket?.ticket_id || ticket?.id || ''
  const qrImageUrl = ticket
    ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
        typeof window !== 'undefined'
          ? `${window.location.origin}/verify?id=${encodeURIComponent(passIdDisplay)}`
          : passIdDisplay
      )}`
    : ''

  return (
    <div className="max-w-lg mx-auto p-4 md:p-6 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between text-xs text-[#a39b8f]">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1d1a17] hover:bg-[#2a2622] text-[#d8d2c8] rounded-full font-semibold transition border border-[#2a2622]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1d1a17] text-[#a39b8f] hover:text-white rounded-full transition border border-[#2a2622]"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#1F9D55]" /> : <VolumeX className="w-3.5 h-3.5 text-[#FF6B6B]" />}
          <span>{soundEnabled ? 'Chime On' : 'Muted'}</span>
        </button>
      </div>

      {/* Header */}
      <div className="text-center space-y-1.5">
        <span className="inline-block px-3 py-1 bg-[#FFD400] text-[#111111] rounded-full text-xs font-black tracking-wider uppercase shadow-sm">
          Gate Scanner &amp; Check-In
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-white">City Mela Pass Verification</h1>
        <p className="text-xs text-[#a39b8f]">Little Guwahati Festival &amp; Pet Puja 2026</p>
      </div>

      {/* Camera Live Viewfinder / Scanner Controls */}
      <div className="bg-[#1d1a17] border border-[#2a2622] rounded-3xl p-4 shadow-xl space-y-4 overflow-hidden">
        {isScanning ? (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-h-80 mx-auto border-2 border-[#FFD400]">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Viewfinder Reticle */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-[#FFD400]/70 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#FFD400]"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-[#FFD400]"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-[#FFD400]"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#FFD400]"></div>
                {/* Laser scan line animation */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#FFD400] to-transparent animate-pulse absolute top-1/2 -translate-y-1/2"></div>
              </div>
            </div>
            <div className="absolute bottom-3 inset-x-0 text-center">
              <span className="bg-black/70 text-[#FFD400] text-xs font-bold px-3 py-1 rounded-full border border-[#FFD400]/40">
                Point camera at attendee pass QR
              </span>
            </div>
          </div>
        ) : null}

        {cameraError && (
          <div className="text-xs text-[#FF8B8B] bg-[#2A1315] p-3 rounded-xl border border-[#FF6B6B]/30 text-center">
            {cameraError}
          </div>
        )}

        {/* Camera action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {isScanning ? (
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2a2622] hover:bg-[#38332e] text-white rounded-full text-xs font-bold transition"
            >
              <CameraOff className="w-4 h-4" />
              <span>Stop Camera</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD400] hover:bg-[#e6bf00] text-[#111] rounded-full text-sm font-black transition shadow-lg cursor-pointer transform hover:-translate-y-0.5"
            >
              <Camera className="w-4 h-4" />
              <span>📷 Start Camera Scanner</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#25211d] hover:bg-[#322c27] text-[#d8d2c8] rounded-full text-xs font-bold transition border border-[#332e29]"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload QR Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Manual Search Bar */}
      <form onSubmit={handleSearchSubmit} className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              placeholder="Enter Ticket ID (e.g. LGF-PASS-9HBG) or Phone..."
              className="w-full px-4 py-3 rounded-xl bg-[#1d1a17] border border-[#332e29] text-white text-sm focus:outline-none focus:border-[#FFD400] placeholder:text-[#6f675c]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-[#FFD400] text-[#111] rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-[#e6bf00] disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Verify</span>
          </button>
        </div>
        <p className="text-[11px] text-[#7d7568] px-1">
          Tip: You can search by Pass ID (<code>LGF-PASS-9HBG</code>), phone number, or paste a pass link.
        </p>
      </form>

      {/* Ticket Card Result */}
      {ticket && (
        <div className="bg-[#FFFBF4] text-[#1A0F0C] rounded-3xl border-2 border-[#1A0F0C] p-6 shadow-2xl space-y-5 animate-fadeIn">
          {/* Status Badge */}
          <div className="text-center">
            {ticket.checked_in || checkinSuccess ? (
              <div className="inline-flex items-center gap-2 bg-[#FEF3C7] border-2 border-[#D97706] text-[#92400E] px-4 py-2 rounded-full text-xs font-black tracking-wide shadow-sm">
                <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                <span>ALREADY CHECKED IN</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-[#DCFCE7] border-2 border-[#16A34A] text-[#166534] px-4 py-2 rounded-full text-xs font-black tracking-wide shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                <span>VALID PASS — READY TO ADMIT</span>
              </div>
            )}
          </div>

          {/* Ticket Header & Name */}
          <div className="text-center space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-[#1A0F0C] text-[#FFD400] font-mono text-xs uppercase tracking-wider font-extrabold">
              {ticket.ticket_id || ticket.id}
            </span>
            <h2 className="text-2xl font-black text-[#1A0F0C] pt-1">{ticket.contact_name}</h2>
            <p className="text-sm font-bold text-[#7A1F2B]">{ticket.brand_name}</p>
          </div>

          {/* Details Table */}
          <div className="border-t border-b border-[#EADDD3] py-3.5 text-xs space-y-2.5">
            <div className="flex justify-between items-start">
              <span className="text-[#6B5560] font-semibold">Pass Type:</span>
              <span className="font-bold text-[#1A0F0C] text-right">{ticket.stall_tier || ticket.category}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-[#6B5560] font-semibold">Inclusions:</span>
              <span className="font-bold text-[#1A0F0C] max-w-[220px] text-right break-words">
                {ticket.hero_dishes}
              </span>
            </div>
            {ticket.location_area && (
              <div className="flex justify-between items-start">
                <span className="text-[#6B5560] font-semibold">School / City:</span>
                <span className="font-bold text-[#1A0F0C]">{ticket.location_area}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-[#6B5560] font-semibold">WhatsApp:</span>
              <span className="font-bold text-[#1A0F0C] font-mono">+91 {ticket.whatsapp_number}</span>
            </div>
            {ticket.created_at && (
              <div className="flex justify-between items-center text-[11px] text-[#6B5560]">
                <span>Registered:</span>
                <span>{new Date(ticket.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>

          {/* Check-in CTA Button */}
          {ticket.checked_in || checkinSuccess ? (
            <div className="space-y-3">
              <div className="text-center p-3.5 bg-[#FEF3C7] text-[#92400E] rounded-2xl text-xs font-bold border border-[#F59E0B]/30">
                ✓ Attendee is already checked into the festival.
              </div>
              <button
                type="button"
                onClick={handleScanNext}
                className="w-full py-3.5 bg-[#1A0F0C] hover:bg-[#2e2624] text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#FFD400]" />
                <span>SCAN NEXT PASS</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="w-full py-4 bg-[#1F9D55] hover:bg-[#188044] text-white font-black text-base rounded-2xl shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
              <button
                type="button"
                onClick={handleScanNext}
                className="w-full py-2.5 text-xs text-[#6B5560] hover:text-[#1A0F0C] font-bold text-center transition"
              >
                Skip / Scan Next Pass →
              </button>
            </div>
          )}

          {/* Quick WhatsApp helper */}
          <div className="text-center pt-1 border-t border-[#EADDD3]">
            <a
              href={`https://wa.me/91${ticket.whatsapp_number}?text=${encodeURIComponent(
                `Hi ${ticket.contact_name}, welcoming you to Little Guwahati Festival & Pet Puja 2026!`
              )}`}
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
        <div className="bg-[#2A1315] border border-[#FF6B6B]/40 rounded-3xl p-6 text-center space-y-3 text-[#FFBABA]">
          <XCircle className="w-10 h-10 mx-auto text-[#FF6B6B]" />
          <h3 className="font-bold text-base text-white">Invalid Pass Code</h3>
          <p className="text-xs max-w-sm mx-auto">{error}</p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={handleScanNext}
              className="px-4 py-2 bg-[#FFD400] text-[#111] rounded-full text-xs font-bold hover:bg-[#e6bf00] transition"
            >
              Try Scanning Again
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-[#332e29] text-white rounded-full text-xs font-semibold hover:bg-[#443d36] transition"
            >
              Check in Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#141210] text-white flex flex-col items-center justify-center p-4">
      <Suspense fallback={<div className="text-white text-center py-12">Loading gate scanner...</div>}>
        <VerifyContent />
      </Suspense>
    </div>
  )
}
