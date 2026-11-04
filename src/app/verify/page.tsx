'use client'

import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react'
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
    const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (type === 'valid') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime)
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35)
      osc.start(); osc.stop(ctx.currentTime + 0.35)
    } else if (type === 'already') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.setValueAtTime(349.23, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(); osc.stop(ctx.currentTime + 0.4)
    } else {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(220, ctx.currentTime)
      osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.12)
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
      osc.start(); osc.stop(ctx.currentTime + 0.3)
    }
  } catch {}
}

function cleanPassInput(raw: string): string {
  const cleaned = (raw || '').trim()
  if (!cleaned) return ''
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    try {
      const url = new URL(cleaned)
      const idParam = url.searchParams.get('id')
      if (idParam) return idParam.trim()
      const match = url.pathname.match(/\/pass\/([^/?#]+)/i)
      if (match && match[1]) return decodeURIComponent(match[1]).trim()
    } catch {}
  }
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

  const [isScanning, setIsScanning] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [scanStatus, setScanStatus] = useState('')

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const lastScannedRef = useRef<string>('')
  const jsQRRef = useRef<any>(null)

  // Load jsQR lazily (client-side only)
  const loadJsQR = useCallback(async () => {
    if (jsQRRef.current) return jsQRRef.current
    try {
      const mod = await import('jsqr')
      jsQRRef.current = mod.default
      return jsQRRef.current
    } catch (e) {
      console.error('Failed to load jsQR:', e)
      return null
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    lastScannedRef.current = ''
    setScanStatus('')
    setIsScanning(false)
  }, [])

  const fetchTicket = useCallback(async (idToFetch: string) => {
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
          data.ticket.checked_in ? playChime('already') : playChime('valid')
        }
      } else {
        setTicket(null)
        setError(data.error || `No valid pass found for "${cleaned}".`)
        if (soundEnabled) playChime('error')
      }
    } catch {
      setError('Network error. Please check your connection.')
      if (soundEnabled) playChime('error')
    } finally {
      setLoading(false)
    }
  }, [soundEnabled])

  // jsQR canvas scan loop
  const scanFrame = useCallback(async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame)
      return
    }

    const jsQR = await loadJsQR()
    if (!jsQR) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    })

    if (code && code.data && code.data !== lastScannedRef.current) {
      lastScannedRef.current = code.data
      const detectedId = cleanPassInput(code.data)
      if (detectedId) {
        stopCamera()
        setSearchId(detectedId)
        fetchTicket(detectedId)
        return
      }
    }

    rafRef.current = requestAnimationFrame(scanFrame)
  }, [loadJsQR, stopCamera, fetchTicket])

  const startCamera = useCallback(async () => {
    setCameraError('')
    setError('')
    setScanStatus('Starting camera...')

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError('Camera not supported in this browser. Please try Chrome or Safari.')
      setScanStatus('')
      return
    }

    try {
      // Try rear camera first, fallback to any camera
      let stream: MediaStream | null = null
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        })
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
      }

      mediaStreamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.setAttribute('playsinline', 'true')
        videoRef.current.setAttribute('muted', 'true')
        await videoRef.current.play()
      }

      setIsScanning(true)
      setScanStatus('Point camera at a QR code...')

      // Preload jsQR before starting loop
      await loadJsQR()
      rafRef.current = requestAnimationFrame(scanFrame)
    } catch (err: any) {
      const msg = err?.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access in your browser settings and try again.'
        : err?.name === 'NotFoundError'
        ? 'No camera found on this device.'
        : `Camera error: ${err?.message || 'Unknown error'}. Please enter the pass ID manually.`
      setCameraError(msg)
      setScanStatus('')
      setIsScanning(false)
    }
  }, [loadJsQR, scanFrame])

  useEffect(() => {
    return () => { stopCamera() }
  }, [stopCamera])

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

  // Handle uploaded image file — decode with jsQR on a canvas
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    try {
      const jsQR = await loadJsQR()
      if (!jsQR) {
        alert('QR decoder not loaded yet. Please try again.')
        return
      }

      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, img.width, img.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        })
        if (code && code.data) {
          const detectedId = cleanPassInput(code.data)
          if (detectedId) {
            setSearchId(detectedId)
            fetchTicket(detectedId)
            return
          }
        }
        alert('No readable QR code found in this photo. Please enter the pass ID manually.')
      }
      img.onerror = () => alert('Could not load the selected image.')
      img.src = URL.createObjectURL(file)
    } catch {
      alert('Error reading QR from image. Please enter pass code manually.')
    }
  }

  useEffect(() => {
    if (initialId) fetchTicket(initialId)
  }, [initialId]) // eslint-disable-line react-hooks/exhaustive-deps

  const passIdDisplay = ticket?.ticket_id || ticket?.id || ''
  const qrImageUrl = ticket
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(
        typeof window !== 'undefined'
          ? `${window.location.origin}/verify?id=${encodeURIComponent(passIdDisplay)}`
          : passIdDisplay
      )}`
    : ''

  return (
    <div className="max-w-lg mx-auto p-4 md:p-6 space-y-5">
      {/* Top nav */}
      <div className="flex items-center justify-between text-xs text-[#a39b8f]">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1d1a17] hover:bg-[#2a2622] text-[#d8d2c8] rounded-full font-semibold transition border border-[#2a2622]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dashboard
        </Link>
        <button
          type="button"
          onClick={() => setSoundEnabled(s => !s)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1d1a17] text-[#a39b8f] hover:text-white rounded-full transition border border-[#2a2622]"
        >
          {soundEnabled
            ? <Volume2 className="w-3.5 h-3.5 text-[#1F9D55]" />
            : <VolumeX className="w-3.5 h-3.5 text-[#FF6B6B]" />}
          {soundEnabled ? 'Chime On' : 'Muted'}
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

      {/* Camera scanner panel */}
      <div className="bg-[#1d1a17] border border-[#2a2622] rounded-3xl p-4 shadow-xl space-y-3 overflow-hidden">
        {isScanning ? (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-h-72 mx-auto border-2 border-[#FFD400]">
            {/* Hidden canvas for jsQR decoding */}
            <canvas ref={canvasRef} className="hidden" />
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
            />
            {/* Viewfinder */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 relative">
                <div className="absolute inset-0 border-2 border-[#FFD400]/40 rounded-xl" />
                <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-[#FFD400] rounded-tl-md" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-[#FFD400] rounded-tr-md" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-[#FFD400] rounded-bl-md" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-[#FFD400] rounded-br-md" />
                <div className="absolute inset-x-4 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#FFD400] to-transparent animate-pulse -translate-y-0.5" />
              </div>
            </div>
            {scanStatus && (
              <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
                <span className="bg-black/70 text-[#FFD400] text-xs font-bold px-3 py-1 rounded-full border border-[#FFD400]/40">
                  {scanStatus}
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Placeholder when not scanning */
          <div className="rounded-2xl bg-[#141210] border-2 border-dashed border-[#2a2622] aspect-square max-h-56 mx-auto flex flex-col items-center justify-center gap-3 text-[#a39b8f]">
            <Camera className="w-10 h-10 opacity-30" />
            <span className="text-xs font-semibold">Camera viewfinder</span>
            <span className="text-[11px] opacity-60">Tap "Start Camera" to scan</span>
          </div>
        )}

        {cameraError && (
          <div className="text-xs text-[#FF8B8B] bg-[#2A1315] p-3 rounded-xl border border-[#FF6B6B]/30 text-center leading-relaxed">
            {cameraError}
          </div>
        )}

        {/* Camera controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {isScanning ? (
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2a2622] hover:bg-[#38332e] text-white rounded-full text-xs font-bold transition"
            >
              <CameraOff className="w-4 h-4" />
              Stop Camera
            </button>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFD400] hover:bg-[#e6bf00] text-[#111] rounded-full text-sm font-black transition shadow-lg cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              📷 Start Camera Scanner
            </button>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#25211d] hover:bg-[#322c27] text-[#d8d2c8] rounded-full text-xs font-bold transition border border-[#332e29]"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload QR Photo
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

      {/* Manual search */}
      <form onSubmit={handleSearchSubmit} className="space-y-1.5">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            placeholder="Enter Ticket ID (e.g. LGF-PASS-9HBG) or Phone..."
            className="flex-1 px-4 py-3 rounded-xl bg-[#1d1a17] border border-[#332e29] text-white text-sm focus:outline-none focus:border-[#FFD400] placeholder:text-[#6f675c]"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-[#FFD400] text-[#111] rounded-xl font-bold text-sm flex items-center gap-1.5 shadow-md cursor-pointer hover:bg-[#e6bf00] disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Verify
          </button>
        </div>
        <p className="text-[11px] text-[#7d7568] px-1">
          Search by Pass ID (<code>LGF-PASS-XXXX</code>), phone number, or paste a pass link.
        </p>
      </form>

      {/* Result card */}
      {ticket && (
        <div className="bg-[#FFFBF4] text-[#1A0F0C] rounded-3xl border-2 border-[#1A0F0C] p-6 shadow-2xl space-y-5">
          {/* Status */}
          <div className="text-center">
            {ticket.checked_in || checkinSuccess ? (
              <div className="inline-flex items-center gap-2 bg-[#FEF3C7] border-2 border-[#D97706] text-[#92400E] px-4 py-2 rounded-full text-xs font-black tracking-wide shadow-sm">
                <AlertTriangle className="w-4 h-4 text-[#D97706]" />
                ALREADY CHECKED IN
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-[#DCFCE7] border-2 border-[#16A34A] text-[#166534] px-4 py-2 rounded-full text-xs font-black tracking-wide shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                VALID PASS — READY TO ADMIT
              </div>
            )}
          </div>

          {/* Identity */}
          <div className="text-center space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-[#1A0F0C] text-[#FFD400] font-mono text-xs uppercase tracking-wider font-extrabold">
              {ticket.ticket_id || ticket.id}
            </span>
            <h2 className="text-2xl font-black text-[#1A0F0C] pt-1">{ticket.contact_name}</h2>
            <p className="text-sm font-bold text-[#7A1F2B]">{ticket.brand_name}</p>
          </div>

          {/* Details */}
          <div className="border-t border-b border-[#EADDD3] py-3.5 text-xs space-y-2.5">
            <div className="flex justify-between items-start">
              <span className="text-[#6B5560] font-semibold">Pass Type:</span>
              <span className="font-bold text-[#1A0F0C] text-right">{ticket.stall_tier || ticket.category}</span>
            </div>
            <div className="flex justify-between items-start">
              <span className="text-[#6B5560] font-semibold">Inclusions:</span>
              <span className="font-bold text-[#1A0F0C] max-w-[220px] text-right break-words">{ticket.hero_dishes}</span>
            </div>
            {ticket.location_area && (
              <div className="flex justify-between">
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

          {/* Check-in actions */}
          {ticket.checked_in || checkinSuccess ? (
            <div className="space-y-3">
              <div className="text-center p-3.5 bg-[#FEF3C7] text-[#92400E] rounded-2xl text-xs font-bold border border-[#F59E0B]/30">
                ✓ Attendee is already checked in to the festival.
              </div>
              <button
                type="button"
                onClick={handleScanNext}
                className="w-full py-3.5 bg-[#1A0F0C] hover:bg-[#2e2624] text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-[#FFD400]" />
                SCAN NEXT PASS
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="w-full py-4 bg-[#1F9D55] hover:bg-[#188044] text-white font-black text-base rounded-2xl shadow-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {checkingIn
                  ? <><RefreshCw className="w-5 h-5 animate-spin" /><span>Checking in attendee…</span></>
                  : <><CheckCircle2 className="w-5 h-5" /><span>CHECK IN ATTENDEE NOW</span></>}
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

          {/* WhatsApp link */}
          <div className="text-center pt-1 border-t border-[#EADDD3]">
            <a
              href={`https://wa.me/91${ticket.whatsapp_number}?text=${encodeURIComponent(
                `Hi ${ticket.contact_name}, welcoming you to Little Guwahati Festival & Pet Puja 2026! 🎉`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#1F9D55] font-bold hover:underline"
            >
              <MessageCircle className="w-4 h-4" />
              Message Attendee on WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-[#2A1315] border border-[#FF6B6B]/40 rounded-3xl p-6 text-center space-y-3 text-[#FFBABA]">
          <XCircle className="w-10 h-10 mx-auto text-[#FF6B6B]" />
          <h3 className="font-bold text-base text-white">Pass Not Found</h3>
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
              Back to Dashboard
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
