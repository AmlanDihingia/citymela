'use client'

import React, { useState } from 'react'
import { X, CheckCircle2, MessageCircle, Loader2, Sparkles, Store, Bell } from 'lucide-react'

interface FestivalModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'vendor' | 'alert'
  festivalId: 'lgf' | 'dd' | 'bwc'
}

const FESTIVAL_DETAILS = {
  lgf: {
    name: 'Little Guwahati Festival',
    dates: '14–15 Nov 2026',
    venue: 'Sati Radhika Shanti Udyan, Guwahati',
    accentColor: '#E8553D',
    bgBadge: '#2F6B45',
    textColor: '#fff',
    vendorTypes: ["Kids' Activities & Toys", "Food & Beverage", "Learning & Books", "Kids Fashion", "Family Experience", "Other Brand"],
    tagline: 'Guwahati’s premier Children’s Day celebration'
  },
  dd: {
    name: 'Discount Dhamaka',
    dates: '27 Nov – 2 Dec 2026',
    venue: 'Maniram Dewan Trade Centre / Riverfront, Guwahati',
    accentColor: '#D10000',
    bgBadge: '#111111',
    textColor: '#FFD400',
    vendorTypes: ["Fashion & Festive Wear", "Footwear & Bags", "Electronics & Appliances", "Home Decor & Kitchen", "Lifestyle & Accessories", "Food Court"],
    tagline: 'Guwahati’s 6-day bumper retail & shopping festival'
  },
  bwc: {
    name: 'Brahmaputra Winter Carnival',
    dates: '23–31 Dec 2026',
    venue: 'Brahmaputra Riverfront, Guwahati',
    accentColor: '#E07A3C',
    bgBadge: '#2F5240',
    textColor: '#F7EBDD',
    vendorTypes: ["Food & Hot Beverage Stall", "Winter Grills & Barbecue", "Crafts & Shawls", "Brand Sponsorship & Pavilion", "Café / Dessert Counter", "Experience Zone"],
    tagline: 'Nine cosy days to close the year by the river'
  }
}

const WHATSAPP_NUMBER = "919181051445"

export default function FestivalModal({
  isOpen,
  onClose,
  mode,
  festivalId
}: FestivalModalProps) {
  const currentFest = FESTIVAL_DETAILS[festivalId] || FESTIVAL_DETAILS.dd

  const [vendorData, setVendorData] = useState({
    brandName: '',
    contactName: '',
    email: '',
    phone: '',
    category: '',
    notes: ''
  })

  const [alertData, setAlertData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: ''
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const digits = vendorData.phone.replace(/\D/g, '')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!vendorData.brandName.trim()) return setError('Please enter your brand or business name.')
    if (!vendorData.contactName.trim()) return setError('Please enter your contact name.')
    if (digits.length < 10) return setError('Please enter a valid 10-digit WhatsApp number.')
    if (!vendorData.email.trim()) return setError('Email address is required.')
    if (!emailRegex.test(vendorData.email.trim())) return setError('Please enter a valid email address.')

    setSubmitting(true)

    // Prepare payload matching applications schema
    const payload = {
      brand_name: vendorData.brandName.trim(),
      contact_name: vendorData.contactName.trim(),
      email: vendorData.email.trim(),
      whatsapp_number: digits.slice(-10),
      kitchen_type: vendorData.category || 'Vendor / Retail',
      category: `${currentFest.name} - ${vendorData.category || 'General'}`,
      hero_dishes: `Festival: ${currentFest.name}. Offerings: ${vendorData.category || 'General'}`,
      stall_tier: 'Festival Stall Enquiry',
      daily_capacity: 'Standard',
      fssai_status: 'N/A or Applicable',
      location_area: 'Guwahati',
      additional_notes: `[${currentFest.name} Enquiry] ${vendorData.notes.trim()}`,
      source: `landing-${festivalId}-modal`
    }

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ticket_id) {
        window.location.href = `/pass/${encodeURIComponent(data.ticket_id)}`
        return
      }
      setSubmitted(true)
    } catch (err: any) {
      console.warn('Submission issue:', err)
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const digits = alertData.phone.replace(/\D/g, '')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!alertData.name.trim()) return setError('Please enter your name.')
    if (digits.length < 10) return setError('Please enter a valid 10-digit WhatsApp number.')
    if (!alertData.email.trim()) return setError('Email address is required.')
    if (!emailRegex.test(alertData.email.trim())) return setError('Please enter a valid email address.')

    setSubmitting(true)

    const payload = {
      brand_name: `${alertData.name.trim()} (Visitor)`,
      contact_name: alertData.name.trim(),
      email: alertData.email.trim(),
      whatsapp_number: digits.slice(-10),
      kitchen_type: 'Visitor / Shopper',
      category: `${currentFest.name} - Updates & Deal Alerts`,
      hero_dishes: 'Attendee Notification',
      stall_tier: 'Visitor Signup',
      daily_capacity: 'N/A',
      fssai_status: 'N/A',
      location_area: 'Guwahati',
      additional_notes: `Visitor requested alerts & updates for ${currentFest.name}`,
      source: `landing-${festivalId}-alert`
    }

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ticket_id) {
        window.location.href = `/pass/${encodeURIComponent(data.ticket_id)}`
        return
      }
    } catch (err) {
      console.warn('Alert submit notice:', err)
    } finally {
      setSubmitting(false)
      setSubmitted(true)
    }
  }

  const waVendorText = `Hi City Mela! I'm interested in booking a stall/space for ${currentFest.name} (${currentFest.dates}). My brand is: ${vendorData.brandName || '[Brand Name]'}.`
  const waAlertText = `Hi City Mela! Please add me to deal & event updates for ${currentFest.name} (${currentFest.dates}). My name is ${alertData.name || '[Name]'}.`

  const activeWaUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    mode === 'vendor' ? waVendorText : waAlertText
  )}`

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#FFFBF4] text-[#141210] rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
      >
        {/* Header Ribbon */}
        <div 
          className="p-6 text-white flex items-start justify-between relative"
          style={{ backgroundColor: currentFest.bgBadge }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="text-xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: currentFest.accentColor, color: '#fff' }}
              >
                {mode === 'vendor' ? 'Stall & Sponsorship' : 'Get Updates & Deals'}
              </span>
              <span className="text-xs opacity-80">{currentFest.dates}</span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-white">{currentFest.name}</h3>
            <p className="text-sm opacity-90 mt-0.5">{currentFest.tagline}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div 
                className="inline-flex items-center justify-center w-16 h-16 rounded-full mx-auto"
                style={{ backgroundColor: `${currentFest.accentColor}20`, color: currentFest.accentColor }}
              >
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-[#141210]">Details Received!</h4>
              <p className="text-[#6B5560] text-base max-w-sm mx-auto">
                Thank you! Our festival team will get in touch regarding slots and details for <strong>{currentFest.name}</strong>.
              </p>
              <div className="pt-2 flex flex-col gap-2.5">
                <a
                  href={activeWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-full font-bold text-white transition shadow-md"
                  style={{ backgroundColor: '#1F9D55' }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Continue on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-sm text-[#6B5560] hover:text-[#141210] font-semibold"
                >
                  Back to page
                </button>
              </div>
            </div>
          ) : mode === 'vendor' ? (
            <form onSubmit={handleVendorSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5560] mb-1.5">
                    Brand / Business <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={vendorData.brandName}
                    onChange={e => setVendorData({ ...vendorData, brandName: e.target.value })}
                    placeholder="e.g. Urban Threads"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADDD3] bg-white text-[#141210] focus:outline-none focus:ring-2 focus:ring-[#141210]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5560] mb-1.5">
                    Contact Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={vendorData.contactName}
                    onChange={e => setVendorData({ ...vendorData, contactName: e.target.value })}
                    placeholder="e.g. Priyam Baruah"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADDD3] bg-white text-[#141210] focus:outline-none focus:ring-2 focus:ring-[#141210]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5560] mb-1.5">
                  WhatsApp Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={vendorData.phone}
                  onChange={e => setVendorData({ ...vendorData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADDD3] bg-white text-[#141210] focus:outline-none focus:ring-2 focus:ring-[#141210]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5560] mb-1.5">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={vendorData.email}
                  onChange={e => setVendorData({ ...vendorData, email: e.target.value })}
                  placeholder="e.g. brand@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADDD3] bg-white text-[#141210] focus:outline-none focus:ring-2 focus:ring-[#141210]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5560] mb-1.5">
                  Category / Offerings
                </label>
                <select
                  value={vendorData.category}
                  onChange={e => setVendorData({ ...vendorData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADDD3] bg-white text-[#141210] focus:outline-none focus:ring-2 focus:ring-[#141210]"
                >
                  <option value="">Select your category</option>
                  {currentFest.vendorTypes.map(vt => (
                    <option key={vt} value={vt}>{vt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5560] mb-1.5">
                  Notes / Space Requirement
                </label>
                <textarea
                  rows={2}
                  value={vendorData.notes}
                  onChange={e => setVendorData({ ...vendorData, notes: e.target.value })}
                  placeholder="Stall size, power requirement, questions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADDD3] bg-white text-[#141210] focus:outline-none focus:ring-2 focus:ring-[#141210] resize-none"
                />
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-full font-bold text-white transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                style={{ backgroundColor: currentFest.accentColor }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting Enquiry…</span>
                  </>
                ) : (
                  <>
                    <Store className="w-5 h-5" />
                    <span>Submit Space Enquiry</span>
                  </>
                )}
              </button>

              <div className="text-center pt-1">
                <span className="text-xs text-[#6B5560]">or message us directly: </span>
                <a
                  href={activeWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#1F9D55] hover:underline"
                >
                  WhatsApp +91 99579 95530
                </a>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAlertSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5560] mb-1.5">
                  Your Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={alertData.name}
                  onChange={e => setAlertData({ ...alertData, name: e.target.value })}
                  placeholder="e.g. Ananya Das"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADDD3] bg-white text-[#141210] focus:outline-none focus:ring-2 focus:ring-[#141210]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5560] mb-1.5">
                  WhatsApp Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={alertData.phone}
                  onChange={e => setAlertData({ ...alertData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADDD3] bg-white text-[#141210] focus:outline-none focus:ring-2 focus:ring-[#141210]"
                />
                <p className="text-xs text-[#6B5560] mt-1">We’ll send deal alerts, lineup drops, and passes directly to your WhatsApp.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5560] mb-1.5">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={alertData.email}
                  onChange={e => setAlertData({ ...alertData, email: e.target.value })}
                  placeholder="e.g. ananya@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#EADDD3] bg-white text-[#141210] focus:outline-none focus:ring-2 focus:ring-[#141210]"
                />
              </div>

              {error && (
                <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-full font-bold text-white transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                style={{ backgroundColor: currentFest.accentColor }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Subscribing…</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-5 h-5" />
                    <span>Get Notified on WhatsApp</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
