'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, MessageCircle, AlertCircle, Loader2 } from 'lucide-react'

const CATEGORIES = [
  "Assamese", "Bengali & Puja favourites", "Momos & NE street food", "Biryani, pulao & rice",
  "Rolls & kebabs", "Indo-Chinese", "South Indian", "Grills, burgers & contemporary",
  "Pure veg & Navratri thali", "Chaat & street food", "Sweets & mishti", "Desserts & ice cream",
  "Café, coffee & chai", "Juices, shakes & mocktails", "Full-menu restaurant (pavilion)", "Something else"
]

const KITCHEN_TYPES = [
  "Restaurant or café",
  "Street food stall or outlet",
  "Sweet shop or bakery",
  "Cloud kitchen",
  "Home chef",
  "Caterer"
]

const STALL_TIERS = [
  "Standard (₹30,000)",
  "Prime aisle (₹50,000)",
  "Premium corner (from ₹75,000)",
  "Rajbari seated dining (from ₹1,00,000)",
  "Half-counter for home chefs (₹18,000)",
  "Not sure yet"
]

const CAPACITY_OPTIONS = [
  "Under 100",
  "100–200",
  "200–400",
  "400+"
]

const FSSAI_OPTIONS = [
  "Yes, valid licence",
  "Applied / in process",
  "No, not yet"
]

const WHATSAPP_NUMBER = "919181051445"

export default function ApplicationForm() {
  const [formData, setFormData] = useState({
    brand: '',
    contact: '',
    email: '',
    phone: '',
    instagram: '',
    type: '',
    category: '',
    dishes: '',
    tier: '',
    capacity: '',
    fssai: '',
    area: '',
    notes: '',
  })

  const [source, setSource] = useState('direct')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submittedData, setSubmittedData] = useState<{
    brand: string
    contact: string
    email: string
    category: string
    ticket_id?: string
  } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const src = params.get('src') || params.get('utm_source') || 'direct'
      setSource(src)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const digits = formData.phone.replace(/\D/g, '')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!formData.brand.trim()) return setError('Enter your brand or kitchen name.')
    if (!formData.contact.trim()) return setError('Enter your name.')
    if (formData.email.trim() && !emailRegex.test(formData.email.trim())) {
      return setError('Please enter a valid email address.')
    }
    if (digits.length < 10) return setError('Enter a valid 10-digit WhatsApp number.')
    if (!formData.type) return setError('Tell us what kind of kitchen you are.')
    if (!formData.category) return setError('Choose your category.')
    if (!formData.dishes.trim()) return setError('Tell us your hero dishes.')
    if (!formData.tier) return setError('Choose which stall you are considering.')
    if (!formData.capacity) return setError('Tell us how many plates you can serve a night.')
    if (!formData.fssai) return setError('Tell us your FSSAI status.')

    setSubmitting(true)

    const payload = {
      brand_name: formData.brand.trim(),
      contact_name: formData.contact.trim(),
      email: formData.email.trim().toLowerCase(),
      whatsapp_number: digits.slice(-10),
      instagram_handle: formData.instagram.trim(),
      kitchen_type: formData.type,
      category: formData.category,
      hero_dishes: formData.dishes.trim(),
      stall_tier: formData.tier,
      daily_capacity: formData.capacity,
      fssai_status: formData.fssai,
      location_area: formData.area.trim(),
      additional_notes: formData.notes.trim(),
      source,
    }

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit application')
      }

      setSubmittedData({
        brand: payload.brand_name,
        contact: payload.contact_name,
        email: payload.email,
        category: payload.category,
        ticket_id: result.ticket_id || result.data?.ticket_id,
      })
      setSubmitted(true)
    } catch (err: any) {
      setError(
        err?.message ||
          "Something went wrong and we couldn't save your details. Please try again or contact us via WhatsApp."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted && submittedData) {
    const firstName = submittedData.contact.split(' ')[0]
    const waText = `Hi Pet Puja, I just applied for a stall — ${submittedData.brand} (${submittedData.category}).`
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`

    return (
      <div className="bg-[#FFFBF4] border border-[#EADDD3] rounded-2xl p-8 text-center animate-fadeIn shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#159A92]/10 text-[#159A92] mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="font-heading text-3xl font-bold text-[#B3122A] mb-2">
          Application received!
        </h3>
        <p className="text-[#6B5560] text-lg mb-2 max-w-md mx-auto">
          Thanks, <span className="font-semibold text-[#2A1320]">{firstName}</span>.
          {submittedData.email ? (
            <> A confirmation has been sent to <span className="font-semibold text-[#B3122A]">{submittedData.email}</span>.</>
          ) : (
            <> Your application has been recorded.</>
          )}
        </p>
        <p className="text-[#6B5560] text-sm mb-6 max-w-md mx-auto">
          We&apos;ll also be in touch on WhatsApp about your slot and layout allotment.
        </p>

        {submittedData.ticket_id && (
          <div className="mb-6 p-4 bg-white border border-[#EADDD3] rounded-xl max-w-sm mx-auto shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B5560] block mb-1">
              Your Application Ref ID
            </span>
            <div className="font-mono text-xl font-black text-[#B3122A]">
              {submittedData.ticket_id}
            </div>
            <a
              href={`/pass/${encodeURIComponent(submittedData.ticket_id)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 px-4 py-2 bg-[#1A0F0C] text-white text-xs font-bold rounded-full hover:bg-[#332e29] transition"
            >
              View Digital Pass &amp; QR Code →
            </a>
          </div>
        )}

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#1F9D55] hover:bg-[#188044] text-white font-heading font-bold px-8 py-3.5 rounded-full text-lg shadow-md transition-all transform hover:-translate-y-0.5"
        >
          <MessageCircle className="w-5 h-5" />
          Message us on WhatsApp
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#FFFBF4] border border-[#EADDD3] rounded-2xl p-6 md:p-8 shadow-sm space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="brand" className="block text-sm font-semibold text-[#2A1320] mb-1">
            Brand / kitchen name <span className="text-[#B3122A]">*</span>
          </label>
          <input
            id="brand"
            type="text"
            value={formData.brand}
            onChange={handleChange}
            placeholder="e.g. Grandma's Kitchen"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADDD3] bg-white text-[#2A1320] text-base focus:outline-none focus:border-[#B3122A] focus:ring-1 focus:ring-[#B3122A] transition"
            autoComplete="organization"
          />
        </div>
        <div>
          <label htmlFor="contact" className="block text-sm font-semibold text-[#2A1320] mb-1">
            Your name <span className="text-[#B3122A]">*</span>
          </label>
          <input
            id="contact"
            type="text"
            value={formData.contact}
            onChange={handleChange}
            placeholder="e.g. Rahul Sharma"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADDD3] bg-white text-[#2A1320] text-base focus:outline-none focus:border-[#B3122A] focus:ring-1 focus:ring-[#B3122A] transition"
            autoComplete="name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-[#2A1320] mb-1">
            Email address <span className="text-xs text-[#6B5560] font-normal">(optional — for email confirmation)</span>
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. rahul@example.com"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADDD3] bg-white text-[#2A1320] text-base focus:outline-none focus:border-[#B3122A] focus:ring-1 focus:ring-[#B3122A] transition"
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-[#2A1320] mb-1">
            WhatsApp number <span className="text-[#B3122A]">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="98xxxxxxxx"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADDD3] bg-white text-[#2A1320] text-base focus:outline-none focus:border-[#B3122A] focus:ring-1 focus:ring-[#B3122A] transition"
            autoComplete="tel"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="instagram" className="block text-sm font-semibold text-[#2A1320] mb-1">
            Instagram handle
          </label>
          <input
            id="instagram"
            type="text"
            value={formData.instagram}
            onChange={handleChange}
            placeholder="@yourkitchen"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADDD3] bg-white text-[#2A1320] text-base focus:outline-none focus:border-[#B3122A] focus:ring-1 focus:ring-[#B3122A] transition"
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-semibold text-[#2A1320] mb-1">
            What kind of kitchen are you? <span className="text-[#B3122A]">*</span>
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADDD3] bg-white text-[#2A1320] text-base focus:outline-none focus:border-[#B3122A] focus:ring-1 focus:ring-[#B3122A] transition"
          >
            <option value="">Select kitchen type</option>
            {KITCHEN_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-semibold text-[#2A1320] mb-1">
          What would you sell at Pet Puja? <span className="text-[#B3122A]">*</span>
        </label>
        <select
          id="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADDD3] bg-white text-[#2A1320] text-base focus:outline-none focus:border-[#B3122A] focus:ring-1 focus:ring-[#B3122A] transition"
        >
          <option value="">Select your category</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="dishes" className="block text-sm font-semibold text-[#2A1320] mb-1">
          Your two or three hero dishes <span className="text-[#B3122A]">*</span>
        </label>
        <input
          id="dishes"
          type="text"
          value={formData.dishes}
          onChange={handleChange}
          placeholder="e.g. steamed chicken momo, chilli pork momo"
          className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADDD3] bg-white text-[#2A1320] text-base focus:outline-none focus:border-[#B3122A] focus:ring-1 focus:ring-[#B3122A] transition"
        />
        <p className="text-xs text-[#6B5560] mt-1">
          No two stalls sell the same hero dish, so this decides your slot.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tier" className="block text-sm font-semibold text-[#2A1320] mb-1">
            Which stall are you considering? <span className="text-[#B3122A]">*</span>
          </label>
          <select
            id="tier"
            value={formData.tier}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADDD3] bg-white text-[#2A1320] text-base focus:outline-none focus:border-[#B3122A] focus:ring-1 focus:ring-[#B3122A] transition"
          >
            <option value="">Select stall tier</option>
            {STALL_TIERS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="capacity" className="block text-sm font-semibold text-[#2A1320] mb-1">
            Plates you can serve a night <span className="text-[#B3122A]">*</span>
          </label>
          <select
            id="capacity"
            value={formData.capacity}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADDD3] bg-white text-[#2A1320] text-base focus:outline-none focus:border-[#B3122A] focus:ring-1 focus:ring-[#B3122A] transition"
          >
            <option value="">Select capacity</option>
            {CAPACITY_OPTIONS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fssai" className="block text-sm font-semibold text-[#2A1320] mb-1">
            FSSAI licence <span className="text-[#B3122A]">*</span>
          </label>
          <select
            id="fssai"
            value={formData.fssai}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADDD3] bg-white text-[#2A1320] text-base focus:outline-none focus:border-[#B3122A] focus:ring-1 focus:ring-[#B3122A] transition"
          >
            <option value="">Select FSSAI status</option>
            {FSSAI_OPTIONS.map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <p className="text-xs text-[#6B5560] mt-1">
            Required before the event. Basic registration is quick if you don&apos;t have one.
          </p>
        </div>
        <div>
          <label htmlFor="area" className="block text-sm font-semibold text-[#2A1320] mb-1">
            Where are you based?
          </label>
          <input
            id="area"
            type="text"
            value={formData.area}
            onChange={handleChange}
            placeholder="e.g. Zoo Road, Uzan Bazar"
            className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADDD3] bg-white text-[#2A1320] text-base focus:outline-none focus:border-[#B3122A] focus:ring-1 focus:ring-[#B3122A] transition"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-[#2A1320] mb-1">
          Anything else we should know?
        </label>
        <textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          placeholder="Events you've done before, your setup, questions..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-[#EADDD3] bg-white text-[#2A1320] text-base focus:outline-none focus:border-[#B3122A] focus:ring-1 focus:ring-[#B3122A] transition resize-y"
        ></textarea>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-[#B3122A] text-sm bg-[#FCEBEE] border border-[#B3122A]/20 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full mt-4 bg-[#B3122A] hover:bg-[#7A0C1E] disabled:opacity-60 text-white font-heading font-bold py-3.5 px-6 rounded-full text-lg transition duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:cursor-wait"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Sending…</span>
          </>
        ) : (
          <span>Apply for a stall</span>
        )}
      </button>

      <p className="text-xs text-[#6B5560] text-center mt-2">
        We&apos;ll only use your details to contact you about Pet Puja.
      </p>
    </form>
  )
}
