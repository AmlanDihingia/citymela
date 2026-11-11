'use client'

import React, { useState, useEffect } from 'react'
import FestivalModal from '@/components/FestivalModal'
import { X, Sparkles, AlertCircle, Loader2 } from 'lucide-react'

type FestivalId = 'lgf' | 'dd' | 'bwc'

interface FestivalTab {
  id: FestivalId
  label: string
  dates: string
}

const TABS: FestivalTab[] = [
  { id: 'lgf', label: 'Little Guwahati Festival', dates: '14–15 Nov' },
  { id: 'dd', label: 'Discount Dhamaka', dates: '27 Nov – 2 Dec' },
  { id: 'bwc', label: 'Brahmaputra Winter Carnival', dates: '23–31 Dec' },
]

interface PassDef {
  id: string
  name: string
  desc: string
  price: number
  unit: string | null
  units: string | null
  soon?: boolean
  full?: boolean
}

const PASS_DEFS: PassDef[] = [
  { id: 'park', name: 'Park entry tickets · skip the queue', desc: 'Pay now and walk straight in at the gate', price: 60, unit: 'person', units: 'people', soon: true },
  { id: 'health', name: 'Free health check-up · Rainbow Pratiksha Hospital', desc: 'For children, both days · we send you a time slot', price: 0, unit: 'child', units: 'children' },
  { id: 'instr', name: 'Try a Music Instrument · XPO Music', desc: 'All ages, both days · we send you a time slot', price: 0, unit: 'person', units: 'people' },
  { id: 'best', name: 'Best Dressed Family Award', desc: 'Dress up together; our judges find you in the park', price: 0, unit: null, units: null },
  { id: 'mic', name: 'Kids’ Open Mic', desc: 'Ages 5–14 · heats on Saturday, Grand Final on Sunday', price: 199, unit: 'performer', units: 'performers' },
  { id: 'art', name: 'Art Competition', desc: 'Ages 4–14 · draw on the spot, judged by age group', price: 0, unit: 'child', units: 'children', full: true },
  { id: 'aws', name: 'Art Workshop', desc: 'Ages 5–14 · materials included · limited seats', price: 299, unit: 'seat', units: 'seats', full: true },
  { id: 'ws', name: 'AI & Robotics Workshop', desc: 'With STEM India · ages 8–14 · 40 seats a session', price: 299, unit: 'seat', units: 'seats' },
  { id: 'crawl', name: 'Crawl Race & Toddler Dash', desc: '6 months to 4 years · Sunday', price: 0, unit: 'little one', units: 'little ones' },
]

const money = (n: number) => (n === 0 ? 'Free' : '₹' + n.toLocaleString('en-IN'))

export default function Home() {
  const [activeTab, setActiveTab] = useState<FestivalId>('lgf')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'vendor' | 'alert'>('vendor')
  const [popupModal, setPopupModal] = useState<'none' | 'kids' | 'family' | 'school' | 'stall'>('none')

  // Pass calculator state
  const [passSel, setPassSel] = useState<Record<string, boolean>>({
    park: false,
    health: false,
    instr: false,
    best: false,
    mic: false,
    art: false,
    aws: false,
    ws: false,
    crawl: false,
  })
  const [passQty, setPassQty] = useState<Record<string, number>>({
    park: 4,
    health: 1,
    instr: 1,
    mic: 1,
    art: 1,
    aws: 1,
    ws: 1,
    crawl: 1,
  })

  // Form states for LGF
  const [kidsForm, setKidsForm] = useState({
    activity: "Kids’ Open Mic (₹199 + GST)",
    name: '',
    age: '',
    school: '',
    parent: '',
    email: '',
    phone: '',
    consent: false,
  })
  const [kidsSubmitting, setKidsSubmitting] = useState(false)
  const [kidsSuccess, setKidsSuccess] = useState('')
  const [kidsError, setKidsError] = useState('')

  const [familyForm, setFamilyForm] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
  })
  const [familySubmitting, setFamilySubmitting] = useState(false)
  const [familySuccess, setFamilySuccess] = useState('')
  const [familyPassId, setFamilyPassId] = useState('')
  const [familyError, setFamilyError] = useState('')

  const [schoolForm, setSchoolForm] = useState({
    name: '',
    type: 'Invited · Free · 3 of 6 championships',
    contact: '',
    role: '',
    phone: '',
    email: '',
    msg: '',
  })
  const [schoolSubmitting, setSchoolSubmitting] = useState(false)
  const [schoolSuccess, setSchoolSuccess] = useState('')
  const [schoolError, setSchoolError] = useState('')

  const [stallForm, setStallForm] = useState({
    biz: '',
    type: 'Food stall · 10×10 ft · ₹12,000 + GST',
    name: '',
    phone: '',
    email: '',
    sell: '',
  })
  const [stallSubmitting, setStallSubmitting] = useState(false)
  const [stallSuccess, setStallSuccess] = useState('')
  const [stallError, setStallError] = useState('')

  // Check URL hash on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'lgf' || hash === 'dd' || hash === 'bwc') {
        setActiveTab(hash)
      }
    }
  }, [])

  // Lock scroll and handle escape key when modal is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPopupModal('none')
      }
    }
    if (popupModal !== 'none') {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [popupModal])

  const handleTabClick = (id: FestivalId) => {
    setActiveTab(id)
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState(null, '', `#${id}`)
    }
  }

  const openVendorModal = () => {
    setModalMode('vendor')
    setModalOpen(true)
  }

  const openAlertModal = () => {
    setModalMode('alert')
    setModalOpen(true)
  }

  // Pass calculator calculation
  let passTotal = 0
  const passLines: { label: string; amount: string }[] = []
  const passItems = PASS_DEFS.map((d) => {
    const q = d.unit ? passQty[d.id] || 1 : 1
    const checked = !d.soon && !d.full && !!passSel[d.id]
    const amt = d.price * q
    if (checked) {
      passTotal += amt
      passLines.push({
        label: d.unit ? `${d.name.split(' · ')[0]} × ${q}` : d.name,
        amount: money(amt),
      })
    }
    return {
      ...d,
      checked,
      showQty: checked && !!d.unit,
      qtyText: `${q} ${q === 1 ? d.unit : d.units}`,
      priceText: d.full
        ? 'Sold out'
        : d.soon
        ? 'Coming soon'
        : d.price === 0
        ? 'Free'
        : checked && d.unit
        ? `${money(amt)} + GST`
        : `${money(d.price)} + GST${d.unit ? ` / ${d.unit}` : ''}`,
      toggle: () => {
        if (!d.soon && !d.full) {
          setPassSel((prev) => ({ ...prev, [d.id]: !checked }))
        }
      },
      inc: () => setPassQty((prev) => ({ ...prev, [d.id]: Math.min((prev[d.id] || 1) + 1, 10) })),
      dec: () => setPassQty((prev) => ({ ...prev, [d.id]: Math.max((prev[d.id] || 1) - 1, 1) })),
    }
  })

  const gstAmt = Math.round(passTotal * 0.18)
  const grandTotal = passTotal + gstAmt
  const hasGst = passTotal > 0
  const gstText = money(gstAmt)
  const totalText = money(grandTotal)
  const passCtaText = grandTotal === 0 ? 'Get my free family pass' : `Pay ${money(grandTotal)} and get my QR tickets`

  // Select activity from card button
  const handleSelectActivity = (activityTitle: string, priceText: string) => {
    const matchingOption = `${activityTitle} (${priceText.toLowerCase()})`
    setKidsForm((prev) => ({ ...prev, activity: matchingOption }))
    setKidsError('')
    setKidsSuccess('')
    setPopupModal('kids')
  }

  // Activity registration submission
  const handleKidsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setKidsError('')
    setKidsSuccess('')

    const phoneDigits = kidsForm.phone.replace(/\D/g, '').slice(-10)
    if (!kidsForm.name.trim()) return setKidsError('Please enter the participant’s name.')
    if (!kidsForm.parent.trim()) return setKidsError('Please enter the parent or guardian’s name.')
    if (!kidsForm.email.trim()) return setKidsError('Email address is mandatory for registration confirmation.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(kidsForm.email.trim())) {
      return setKidsError('Please enter a valid email address.')
    }
    if (kidsForm.activity.toLowerCase().includes('art competition') || kidsForm.activity.toLowerCase().includes('art workshop')) {
      return setKidsError('Online registrations for this activity are at maximum capacity (Sold Out). Please choose another activity.')
    }
    if (phoneDigits.length < 10) return setKidsError('Please enter a valid 10-digit WhatsApp number.')
    if (!kidsForm.consent) return setKidsError('Parent or guardian consent is required to register.')

    setKidsSubmitting(true)
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: `Activity: ${kidsForm.name.trim()} (${kidsForm.activity})`,
          contact_name: kidsForm.parent.trim(),
          email: kidsForm.email.trim(),
          whatsapp_number: phoneDigits,
          kitchen_type: 'Activity Registration',
          category: `LGF - ${kidsForm.activity}`,
          hero_dishes: `Participant: ${kidsForm.name.trim()}, Age: ${kidsForm.age || 'N/A'}, School: ${kidsForm.school || 'N/A'}`,
          stall_tier: kidsForm.activity,
          location_area: kidsForm.school || 'Guwahati',
          additional_notes: `Consent: Yes, Activity: ${kidsForm.activity}, Email: ${kidsForm.email.trim()}`,
          source: 'lgf-activity-signup',
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        const ticketId = data.ticket_id || 'CONFIRMED'
        setKidsSuccess('Registration confirmed! Redirecting to your official pass...')
        window.location.href = `/pass/${encodeURIComponent(ticketId)}`
        return
      } else {
        setKidsError(data.error || 'Failed to submit registration. Please try again.')
      }
    } catch {
      setKidsError('Network error. Please try again or WhatsApp us.')
    } finally {
      setKidsSubmitting(false)
    }
  }

  // Family Pass submission
  const handleFamilySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFamilyError('')
    setFamilySuccess('')

    const phoneDigits = familyForm.phone.replace(/\D/g, '').slice(-10)
    if (!familyForm.name.trim()) return setFamilyError('Please enter your full name.')
    if (!familyForm.email.trim()) return setFamilyError('Email address is mandatory to receive your digital entry pass.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(familyForm.email.trim())) {
      return setFamilyError('Please enter a valid email address.')
    }
    if (phoneDigits.length < 10) return setFamilyError('Please enter a valid 10-digit WhatsApp number.')

    setFamilySubmitting(true)
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: `Family Pass: ${familyForm.name.trim()}`,
          contact_name: familyForm.name.trim(),
          email: familyForm.email.trim(),
          whatsapp_number: phoneDigits,
          kitchen_type: 'Family Pass',
          category: 'LGF - Family Pass Booking',
          hero_dishes: passLines.map((l) => `${l.label} (${l.amount})`).join(', ') || 'Free Family Pass',
          stall_tier: totalText,
          location_area: familyForm.school || 'Guwahati',
          additional_notes: `Email: ${familyForm.email.trim()}, School: ${familyForm.school || 'N/A'}, Total: ${totalText}`,
          source: 'lgf-family-pass',
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        const ticketId = data.ticket_id || 'CONFIRMED'
        setFamilyPassId(ticketId)
        setFamilySuccess(`Family pass registered! Redirecting to your digital pass...`)
        window.location.href = `/pass/${encodeURIComponent(ticketId)}`
        return
      } else {
        setFamilyError(data.error || 'Failed to register family pass. Please try again.')
      }
    } catch {
      setFamilyError('Network error. Please try again or WhatsApp us.')
    } finally {
      setFamilySubmitting(false)
    }
  }

  // School Registration submission
  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSchoolError('')
    setSchoolSuccess('')

    const phoneDigits = schoolForm.phone.replace(/\D/g, '').slice(-10)
    if (!schoolForm.name.trim()) return setSchoolError('Please enter your school name.')
    if (!schoolForm.contact.trim()) return setSchoolError('Please enter your contact name.')
    if (!schoolForm.email.trim()) return setSchoolError('Email address is mandatory for championship registration.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(schoolForm.email.trim())) {
      return setSchoolError('Please enter a valid email address.')
    }
    if (phoneDigits.length < 10) return setSchoolError('Please enter a valid 10-digit phone/WhatsApp number.')

    setSchoolSubmitting(true)
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: schoolForm.name.trim(),
          contact_name: schoolForm.contact.trim(),
          email: schoolForm.email.trim(),
          whatsapp_number: phoneDigits,
          kitchen_type: 'School Championship',
          category: `LGF School - ${schoolForm.type}`,
          hero_dishes: `Role: ${schoolForm.role}, Championships: ${schoolForm.msg || 'All standard'}`,
          stall_tier: schoolForm.type,
          location_area: schoolForm.name.trim(),
          additional_notes: `Email: ${schoolForm.email.trim()}, Role: ${schoolForm.role}, Message: ${schoolForm.msg}`,
          source: 'lgf-school-registration',
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        const ticketId = data.ticket_id || 'CONFIRMED'
        setSchoolSuccess('School registered! Redirecting to your confirmed booking pass...')
        window.location.href = `/pass/${encodeURIComponent(ticketId)}`
        return
      } else {
        setSchoolError(data.error || 'Failed to submit school registration.')
      }
    } catch {
      setSchoolError('Network error. Please try again.')
    } finally {
      setSchoolSubmitting(false)
    }
  }

  // Stall booking submission
  const handleStallSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStallError('')
    setStallSuccess('')

    const phoneDigits = stallForm.phone.replace(/\D/g, '').slice(-10)
    if (!stallForm.biz.trim()) return setStallError('Please enter your brand or business name.')
    if (!stallForm.name.trim()) return setStallError('Please enter your contact name.')
    if (!stallForm.email.trim()) return setStallError('Email address is mandatory for stall booking invoice & confirmation.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stallForm.email.trim())) {
      return setStallError('Please enter a valid email address.')
    }
    if (phoneDigits.length < 10) return setStallError('Please enter a valid 10-digit WhatsApp number.')

    setStallSubmitting(true)
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: stallForm.biz.trim(),
          contact_name: stallForm.name.trim(),
          email: stallForm.email.trim(),
          whatsapp_number: phoneDigits,
          kitchen_type: 'LGF Stall',
          category: `LGF Stall - ${stallForm.type}`,
          hero_dishes: `Selling: ${stallForm.sell || 'General items'}`,
          stall_tier: stallForm.type,
          location_area: 'Guwahati',
          additional_notes: `Email: ${stallForm.email.trim()}, Offering: ${stallForm.sell}`,
          source: 'lgf-stall-booking',
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        const ticketId = data.ticket_id || 'CONFIRMED'
        setStallSuccess('Booking request sent! Redirecting to confirmation pass...')
        window.location.href = `/pass/${encodeURIComponent(ticketId)}`
        return
      } else {
        setStallError(data.error || 'Failed to submit stall booking.')
      }
    } catch {
      setStallError('Network error. Please try again.')
    } finally {
      setStallSubmitting(false)
    }
  }

  return (
    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", color: '#111', minHeight: '100vh', background: '#141210', overflowX: 'hidden' }}>
      {/* Sticky Top Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 30, background: '#141210', borderBottom: '1px solid #2a2622' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '10px 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <a href="#top" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', color: '#fff' }}>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '0.04em' }}>CITY MELA</span>
            <span style={{ fontSize: 11, color: '#a39b8f' }}>The city comes together</span>
          </a>

          {/* Horizontally scrollable tabs for phone screens */}
          <nav aria-label="Festivals" className="scroll-nav" style={{ gap: 4, background: '#1d1a17', padding: 4, borderRadius: 999, maxWidth: '100%' }}>
            {TABS.map((tab) => {
              const isOn = tab.id === activeTab
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`tab ${isOn ? `on-${tab.id}` : ''}`}
                  onClick={() => handleTabClick(tab.id)}
                  aria-pressed={isOn}
                >
                  <span>{tab.label}</span>
                  <small>{tab.dates}</small>
                </button>
              )
            })}
          </nav>
        </div>
      </header>

      {/* ============ LITTLE GUWAHATI FESTIVAL ============ */}
      {activeTab === 'lgf' && (
        <main id="top" className="animate-fade-in" style={{ background: '#FFF7EE', color: '#1A0F0C', fontFamily: "'Nunito', Arial, sans-serif", overflowX: 'hidden' }}>
          {/* LGF Sub-Header with mobile horizontal swipeable navigation */}
          <header style={{ background: '#7A1F2B', color: '#FFF7EE' }}>
            <nav aria-label="Main" style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <a href="#lgf-top" style={{ fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(20px, 5vw, 26px)', color: '#FFC93C', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Little Guwahati Festival
              </a>
              <div className="scroll-nav" style={{ gap: 14, fontWeight: 800, fontSize: 15, maxWidth: '100%', paddingBottom: 2, alignItems: 'center' }}>
                <button type="button" onClick={() => setPopupModal('kids')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: '#FFF7EE', fontWeight: 800, fontSize: 15, padding: 0, whiteSpace: 'nowrap' }}>Sign up</button>
                <button type="button" onClick={() => setPopupModal('school')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: '#FFF7EE', fontWeight: 800, fontSize: 15, padding: 0, whiteSpace: 'nowrap' }}>Coolest School</button>
                <a href="#whatson" style={{ color: '#FFF7EE', textDecoration: 'none', whiteSpace: 'nowrap' }}>What’s on</a>
                <button type="button" onClick={() => setPopupModal('stall')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: '#FFF7EE', fontWeight: 800, fontSize: 15, padding: 0, whiteSpace: 'nowrap' }}>Book a stall</button>
                <a href="#partners" style={{ color: '#FFF7EE', textDecoration: 'none', whiteSpace: 'nowrap' }}>Partners</a>
                <a href="#schools" style={{ color: '#FFF7EE', textDecoration: 'none', whiteSpace: 'nowrap' }}>School rules</a>
                <a href="/terms" style={{ color: '#FFF7EE', textDecoration: 'none', whiteSpace: 'nowrap' }}>Terms and Conditions</a>
                <button type="button" onClick={() => setPopupModal('family')} style={{ background: '#FFC93C', color: '#1A0F0C', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, padding: '10px 18px', borderRadius: 999, minHeight: 40, boxSizing: 'border-box', display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                  Family pass
                </button>
              </div>
            </nav>
          </header>

          {/* Hero Section */}
          <section id="lgf-top" style={{ background: '#7A1F2B', color: '#FFF7EE', padding: 'clamp(36px, 6vw, 48px) 16px clamp(48px, 10vw, 96px)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'clamp(32px, 6vw, 48px)' }}>
              <div style={{ flex: '999 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <p style={{ margin: 0, alignSelf: 'flex-start', background: '#1A0F0C', color: '#FFC93C', fontWeight: 900, letterSpacing: 2, fontSize: 'clamp(11px, 2.5vw, 14px)', padding: '6px 14px', borderRadius: 999, lineHeight: 1.3 }}>
                  CITY MELA PRESENTS · A CHILDREN’S DAY CELEBRATION
                </p>
                <h1 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(40px, 8vw, 96px)', lineHeight: 1.05, color: '#FFC93C' }}>
                  Big plans for little people
                </h1>
                <p style={{ margin: 0, fontSize: 'clamp(17px, 3vw, 22px)', lineHeight: 1.5, maxWidth: 620 }}>
                  Two days of shows, music, play, free health check-ups and the Coolest School Championship, on the Brahmaputra riverfront. 14–15 November 2026.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <button type="button" onClick={() => setPopupModal('kids')} style={{ background: '#FFC93C', color: '#1A0F0C', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 900, fontSize: 'clamp(15px, 2.8vw, 18px)', padding: '14px 24px', borderRadius: 999, boxShadow: '0 6px 0 #1A0F0C', minHeight: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxSizing: 'border-box' }}>
                    Sign up for an activity
                  </button>
                  <button type="button" onClick={() => setPopupModal('family')} style={{ background: '#FFF7EE', color: '#7A1F2B', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 900, fontSize: 'clamp(15px, 2.8vw, 18px)', padding: '14px 24px', borderRadius: 999, boxShadow: '0 6px 0 #1A0F0C', minHeight: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxSizing: 'border-box' }}>
                    Get your family pass
                  </button>
                  <button type="button" onClick={() => setPopupModal('stall')} style={{ background: '#1A0F0C', color: '#FFC93C', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 900, fontSize: 'clamp(15px, 2.8vw, 18px)', padding: '14px 24px', borderRadius: 999, boxShadow: '0 6px 0 #FFC93C', minHeight: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxSizing: 'border-box' }}>
                    Book your stall
                  </button>
                </div>
              </div>

              {/* 6 Rotated Letter Tiles (Responsive) */}
              <div style={{ flex: '1 1 280px', maxWidth: 360, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 'clamp(8px, 2.5vw, 14px)' }} aria-hidden="true">
                <div style={{ background: '#FFC93C', color: '#1A0F0C', borderRadius: 'clamp(16px, 3vw, 24px)', boxShadow: '0 6px 0 #1A0F0C', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(36px, 9vw, 64px)', transform: 'rotate(-6deg)' }}>L</div>
                <div style={{ background: '#FF6B2C', color: '#FFF7EE', borderRadius: 'clamp(16px, 3vw, 24px)', boxShadow: '0 6px 0 #1A0F0C', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(36px, 9vw, 64px)', transform: 'rotate(5deg)' }}>I</div>
                <div style={{ background: '#FF7AC6', color: '#1A0F0C', borderRadius: 'clamp(16px, 3vw, 24px)', boxShadow: '0 6px 0 #1A0F0C', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(36px, 9vw, 64px)', transform: 'rotate(-3deg)' }}>T</div>
                <div style={{ background: '#FFF7EE', color: '#7A1F2B', borderRadius: 'clamp(16px, 3vw, 24px)', boxShadow: '0 6px 0 #1A0F0C', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(36px, 9vw, 64px)', transform: 'rotate(7deg)' }}>T</div>
                <div style={{ background: '#FFC93C', color: '#1A0F0C', borderRadius: 'clamp(16px, 3vw, 24px)', boxShadow: '0 6px 0 #1A0F0C', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(36px, 9vw, 64px)', transform: 'rotate(-5deg)' }}>L</div>
                <div style={{ background: '#FF6B2C', color: '#FFF7EE', borderRadius: 'clamp(16px, 3vw, 24px)', boxShadow: '0 6px 0 #1A0F0C', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(36px, 9vw, 64px)', transform: 'rotate(4deg)' }}>E</div>
              </div>
            </div>
          </section>

          {/* Overlapping Quick Info Cards */}
          <section aria-label="Festival details" style={{ padding: '0 16px' }}>
            <div style={{ maxWidth: 1200, margin: 'clamp(-32px, -5vw, -48px) auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <div style={{ background: '#FFC93C', borderRadius: 20, padding: 'clamp(18px, 4vw, 24px)', boxShadow: '0 6px 0 #1A0F0C' }}>
                <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 13, color: '#7A1F2B' }}>WHEN</p>
                <p style={{ margin: '6px 0 0', fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(24px, 4.5vw, 30px)', color: '#7A1F2B' }}>14–15 Nov</p>
                <p style={{ margin: '4px 0 0', fontSize: 15 }}>Sat &amp; Sun, 12 noon to 8 PM</p>
              </div>
              <div style={{ background: '#FF7AC6', borderRadius: 20, padding: 'clamp(18px, 4vw, 24px)', boxShadow: '0 6px 0 #1A0F0C' }}>
                <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 13, color: '#7A1F2B' }}>WHERE</p>
                <p style={{ margin: '6px 0 0', fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(24px, 4.5vw, 30px)', color: '#7A1F2B' }}>Riverfront</p>
                <p style={{ margin: '4px 0 0', fontSize: 15 }}>Sati Radhika Shanti Udyan, Uzan Bazar</p>
              </div>
              <div style={{ background: '#FF6B2C', borderRadius: 20, padding: 'clamp(18px, 4vw, 24px)', boxShadow: '0 6px 0 #1A0F0C' }}>
                <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 13 }}>WHO</p>
                <p style={{ margin: '6px 0 0', fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(24px, 4.5vw, 30px)' }}>Ages 0–16</p>
                <p style={{ margin: '4px 0 0', fontSize: 15 }}>and the families who bring them</p>
              </div>
              <div style={{ background: '#1A0F0C', color: '#FFF7EE', borderRadius: 20, padding: 'clamp(18px, 4vw, 24px)', boxShadow: '0 6px 0 #7A1F2B' }}>
                <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 13, color: '#FFC93C' }}>ENTRY</p>
                <p style={{ margin: '6px 0 0', fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(24px, 4.5vw, 30px)', color: '#FFC93C' }}>Park ticket</p>
                <p style={{ margin: '4px 0 0', fontSize: 15 }}>Get your free family pass online</p>
              </div>
            </div>
          </section>

          {/* Activities Section */}
          <section id="kids" style={{ padding: 'clamp(48px, 8vw, 96px) 16px 48px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 13, color: '#7A1F2B' }}>SIGN UP FOR AN ACTIVITY</p>
                <h2 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(32px, 6vw, 68px)', lineHeight: 1.05, color: '#7A1F2B' }}>
                  Your moment on the big stage
                </h2>
                <p style={{ margin: 0, fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.5, maxWidth: 760 }}>
                  Sing, draw, play an instrument, build a robot or race. Students can sign up themselves, and parents can sign up younger children. Places are limited, so sign up early.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
                {/* 1. Open Mic */}
                <div style={{ background: '#FFF7EE', borderRadius: 24, padding: 'clamp(20px, 4vw, 28px)', boxShadow: '0 6px 0 #1A0F0C', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ margin: 0, alignSelf: 'flex-start', background: '#FFC93C', color: '#1A0F0C', fontWeight: 900, fontSize: 13, letterSpacing: 1, padding: '5px 14px', borderRadius: 999 }}>
                    ₹199 + GST
                  </p>
                  <h3 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(24px, 4.5vw, 30px)', lineHeight: 1.1, color: '#7A1F2B' }}>
                    Kids’ Open Mic
                  </h3>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, flexGrow: 1 }}>
                    Sing, rap, recite or tell a joke. Heats on Saturday, Grand Final on Sunday, with prizes for the top three.
                  </p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#5A4038' }}>Ages 5–14 · Main stage</p>
                  <button
                    type="button"
                    onClick={() => handleSelectActivity("Kids’ Open Mic", "₹199 + GST")}
                    style={{ background: '#7A1F2B', color: '#FFF7EE', fontWeight: 900, fontSize: 16, padding: '12px 22px', borderRadius: 999, boxShadow: '0 5px 0 #1A0F0C', border: 'none', fontFamily: 'inherit', cursor: 'pointer', minHeight: 46, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Sign up
                  </button>
                </div>

                {/* 2. Art Competition — SOLD OUT */}
                <div style={{ background: '#FFF7EE', borderRadius: 24, padding: 'clamp(20px, 4vw, 28px)', boxShadow: '0 6px 0 #1A0F0C', display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.7, position: 'relative' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <p style={{ margin: 0, background: '#7A1F2B', color: '#FFF7EE', fontWeight: 900, fontSize: 13, letterSpacing: 1, padding: '5px 14px', borderRadius: 999 }}>
                      FREE
                    </p>
                    <p style={{ margin: 0, background: '#1A0F0C', color: '#FF6B6B', fontWeight: 900, fontSize: 12, letterSpacing: 1.5, padding: '5px 14px', borderRadius: 999, textTransform: 'uppercase' }}>
                      🔴 Sold Out
                    </p>
                  </div>
                  <h3 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(24px, 4.5vw, 30px)', lineHeight: 1.1, color: '#7A1F2B' }}>
                    Art Competition
                  </h3>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, flexGrow: 1 }}>
                    Draw on the spot at the festival, judged by age group, with prizes for the winners.
                  </p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#5A4038' }}>Ages 4–14 · Both days</p>
                  <button
                    type="button"
                    disabled
                    style={{ background: '#EADDD3', color: '#8C7E74', fontWeight: 900, fontSize: 16, padding: '12px 22px', borderRadius: 999, boxShadow: '0 5px 0 #D5CBC3', border: 'none', fontFamily: 'inherit', cursor: 'not-allowed', minHeight: 46, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    🔒 Registrations Closed
                  </button>
                </div>

                {/* 3. Art Workshop — SOLD OUT */}
                <div style={{ background: '#FFF7EE', borderRadius: 24, padding: 'clamp(20px, 4vw, 28px)', boxShadow: '0 6px 0 #1A0F0C', display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.7, position: 'relative' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <p style={{ margin: 0, background: '#1A0F0C', color: '#FF6B6B', fontWeight: 900, fontSize: 12, letterSpacing: 1.5, padding: '5px 14px', borderRadius: 999, textTransform: 'uppercase' }}>
                      🔴 Sold Out
                    </p>
                  </div>
                  <h3 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(24px, 4.5vw, 30px)', lineHeight: 1.1, color: '#7A1F2B' }}>
                    Art Workshop
                  </h3>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, flexGrow: 1 }}>
                    Learn a new technique with a working artist and take your artwork home. All materials included.
                  </p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#5A4038' }}>Ages 5–14 · Both days · Limited seats</p>
                  <button
                    type="button"
                    disabled
                    style={{ background: '#EADDD3', color: '#8C7E74', fontWeight: 900, fontSize: 16, padding: '12px 22px', borderRadius: 999, boxShadow: '0 5px 0 #D5CBC3', border: 'none', fontFamily: 'inherit', cursor: 'not-allowed', minHeight: 46, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    🔒 Registrations Closed
                  </button>
                </div>

                {/* 4. AI & Robotics Workshop */}
                <div style={{ background: '#FFF7EE', borderRadius: 24, padding: 'clamp(20px, 4vw, 28px)', boxShadow: '0 6px 0 #1A0F0C', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ margin: 0, alignSelf: 'flex-start', background: '#FF6B2C', color: '#FFF7EE', fontWeight: 900, fontSize: 13, letterSpacing: 1, padding: '5px 14px', borderRadius: 999 }}>
                    ₹299 + GST
                  </p>
                  <h3 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(24px, 4.5vw, 30px)', lineHeight: 1.1, color: '#7A1F2B' }}>
                    AI &amp; Robotics Workshop
                  </h3>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, flexGrow: 1 }}>
                    A hands-on session with STEM India. Build, code and take the ideas home.
                  </p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#5A4038' }}>Ages 8–14 · Saturday and Sunday · 40 seats a session</p>
                  <button
                    type="button"
                    onClick={() => handleSelectActivity("AI & Robotics Workshop", "₹299 + GST")}
                    style={{ background: '#7A1F2B', color: '#FFF7EE', fontWeight: 900, fontSize: 16, padding: '12px 22px', borderRadius: 999, boxShadow: '0 5px 0 #1A0F0C', border: 'none', fontFamily: 'inherit', cursor: 'pointer', minHeight: 46, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Sign up
                  </button>
                </div>

                {/* 5. Music Instrument */}
                <div style={{ background: '#FFF7EE', borderRadius: 24, padding: 'clamp(20px, 4vw, 28px)', boxShadow: '0 6px 0 #1A0F0C', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ margin: 0, alignSelf: 'flex-start', background: '#7A1F2B', color: '#FFF7EE', fontWeight: 900, fontSize: 13, letterSpacing: 1, padding: '5px 14px', borderRadius: 999 }}>
                    FREE
                  </p>
                  <h3 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(24px, 4.5vw, 30px)', lineHeight: 1.1, color: '#7A1F2B' }}>
                    Try a Music Instrument
                  </h3>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, flexGrow: 1 }}>
                    Ukulele, drums, keyboard and more with XPO Music, our Official Music Partner.
                  </p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#5A4038' }}>All ages · Both days</p>
                  <button
                    type="button"
                    onClick={() => handleSelectActivity("Try a Music Instrument", "free")}
                    style={{ background: '#7A1F2B', color: '#FFF7EE', fontWeight: 900, fontSize: 16, padding: '12px 22px', borderRadius: 999, boxShadow: '0 5px 0 #1A0F0C', border: 'none', fontFamily: 'inherit', cursor: 'pointer', minHeight: 46, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Sign up
                  </button>
                </div>

                {/* 6. Crawl Race */}
                <div style={{ background: '#FFF7EE', borderRadius: 24, padding: 'clamp(20px, 4vw, 28px)', boxShadow: '0 6px 0 #1A0F0C', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ margin: 0, alignSelf: 'flex-start', background: '#7A1F2B', color: '#FFF7EE', fontWeight: 900, fontSize: 13, letterSpacing: 1, padding: '5px 14px', borderRadius: 999 }}>
                    FREE
                  </p>
                  <h3 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(24px, 4.5vw, 30px)', lineHeight: 1.1, color: '#7A1F2B' }}>
                    Crawl Race &amp; Toddler Dash
                  </h3>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, flexGrow: 1 }}>
                    The cutest race in Guwahati, on the main stage, with a medal for every little one.
                  </p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#5A4038' }}>6 months–4 years · Sunday</p>
                  <button
                    type="button"
                    onClick={() => handleSelectActivity("Crawl Race & Toddler Dash", "free")}
                    style={{ background: '#7A1F2B', color: '#FFF7EE', fontWeight: 900, fontSize: 16, padding: '12px 22px', borderRadius: 999, boxShadow: '0 5px 0 #1A0F0C', border: 'none', fontFamily: 'inherit', cursor: 'pointer', minHeight: 46, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Sign up
                  </button>
                </div>
              </div>

              {/* Activity Signup Form */}
              <div id="kids-form" style={{ background: '#7A1F2B', color: '#FFF7EE', borderRadius: 'clamp(20px, 4vw, 32px)', padding: 'clamp(20px, 5vw, 36px)', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                <div style={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1.05, color: '#FFC93C' }}>
                    Register in a minute
                  </h3>
                  <p style={{ margin: 0, fontSize: 'clamp(15px, 2.5vw, 18px)', lineHeight: 1.5 }}>
                    Pick an activity and add the participant’s details. We’ll confirm the slot on WhatsApp.
                  </p>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#F5DCC8' }}>
                    Open Mic and workshop places are paid at checkout. All prices + 18% GST. Anyone under 18 needs a parent or guardian’s consent.
                  </p>
                </div>

                <form onSubmit={handleKidsSubmit} aria-label="Sign up for an activity" style={{ flex: '2 1 320px', minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  {kidsSuccess && (
                    <div style={{ gridColumn: '1 / -1', background: '#FFC93C', color: '#1A0F0C', padding: '12px 18px', borderRadius: 12, fontWeight: 800, fontSize: 15 }}>
                      ✓ {kidsSuccess}
                    </div>
                  )}
                  {kidsError && (
                    <div style={{ gridColumn: '1 / -1', background: '#FF6B2C', color: '#FFF7EE', padding: '12px 18px', borderRadius: 12, fontWeight: 800, fontSize: 15 }}>
                      ⚠️ {kidsError}
                    </div>
                  )}

                  <label htmlFor="k-act" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 800, fontSize: 14 }}>
                    Activity
                    <select
                      id="k-act"
                      value={kidsForm.activity}
                      onChange={(e) => setKidsForm({ ...kidsForm, activity: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                    >
                      <option>Kids’ Open Mic (₹199 + GST)</option>
                      <option disabled value="Art Competition (free)">Art Competition (free) — 🔴 Sold Out</option>
                      <option disabled value="Art Workshop">Art Workshop — 🔴 Sold Out</option>
                      <option>AI &amp; Robotics Workshop (₹299 + GST)</option>
                      <option>Try a Music Instrument (free)</option>
                      <option>Crawl Race &amp; Toddler Dash (free)</option>
                    </select>
                  </label>

                  <label htmlFor="k-name" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 800, fontSize: 14 }}>
                    Participant’s name
                    <input
                      id="k-name"
                      type="text"
                      placeholder="Full name"
                      value={kidsForm.name}
                      onChange={(e) => setKidsForm({ ...kidsForm, name: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                      required
                    />
                  </label>

                  <label htmlFor="k-age" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 800, fontSize: 14 }}>
                    Age
                    <input
                      id="k-age"
                      type="number"
                      placeholder="Age in years"
                      value={kidsForm.age}
                      onChange={(e) => setKidsForm({ ...kidsForm, age: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                    />
                  </label>

                  <label htmlFor="k-school" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 800, fontSize: 14 }}>
                    School (optional)
                    <input
                      id="k-school"
                      type="text"
                      placeholder="School name"
                      value={kidsForm.school}
                      onChange={(e) => setKidsForm({ ...kidsForm, school: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                    />
                  </label>

                  <label htmlFor="k-parent" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 800, fontSize: 14 }}>
                    Parent or guardian’s name
                    <input
                      id="k-parent"
                      type="text"
                      placeholder="Full name"
                      value={kidsForm.parent}
                      onChange={(e) => setKidsForm({ ...kidsForm, parent: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                      required
                    />
                  </label>

                  <label htmlFor="k-email" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 800, fontSize: 14 }}>
                    Email address *
                    <input
                      id="k-email"
                      type="email"
                      placeholder="parent@example.com"
                      value={kidsForm.email}
                      onChange={(e) => setKidsForm({ ...kidsForm, email: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                      required
                    />
                  </label>

                  <label htmlFor="k-phone" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontWeight: 800, fontSize: 14 }}>
                    Parent or guardian’s WhatsApp
                    <input
                      id="k-phone"
                      type="tel"
                      placeholder="+91"
                      value={kidsForm.phone}
                      onChange={(e) => setKidsForm({ ...kidsForm, phone: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                      required
                    />
                  </label>

                  <label htmlFor="k-consent" style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, lineHeight: 1.5, cursor: 'pointer' }}>
                    <input
                      id="k-consent"
                      type="checkbox"
                      checked={kidsForm.consent}
                      onChange={(e) => setKidsForm({ ...kidsForm, consent: e.target.checked })}
                      style={{ width: 22, height: 22, marginTop: 2, flexShrink: 0, accentColor: '#FFC93C' }}
                      required
                    />
                    <span>The parent or guardian agrees to the participant taking part and being photographed at the festival.</span>
                  </label>

                  <button
                    type="submit"
                    disabled={kidsSubmitting}
                    style={{ background: '#FFC93C', color: '#1A0F0C', fontWeight: 900, fontSize: 17, padding: '14px 24px', borderRadius: 999, boxShadow: '0 5px 0 #1A0F0C', border: 'none', fontFamily: 'inherit', cursor: kidsSubmitting ? 'not-allowed' : 'pointer', minHeight: 48, gridColumn: '1 / -1', justifySelf: 'start', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {kidsSubmitting ? 'Registering...' : 'Sign me up'}
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* Free with Family Pass */}
          <section id="free" style={{ padding: '24px 16px clamp(48px, 8vw, 96px)' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 13, color: '#7A1F2B' }}>FREE WITH YOUR FAMILY PASS</p>
                <h2 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(28px, 5vw, 56px)', lineHeight: 1.05, color: '#7A1F2B' }}>
                  Two things every family should book
                </h2>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                <div style={{ flex: '1 1 300px', minWidth: 0, background: '#7A1F2B', color: '#FFF7EE', borderRadius: 'clamp(20px, 4vw, 32px)', padding: 'clamp(24px, 5vw, 40px)', boxShadow: '0 8px 0 #1A0F0C', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ margin: 0, alignSelf: 'flex-start', background: '#FFC93C', color: '#1A0F0C', fontWeight: 900, letterSpacing: 2, fontSize: 13, padding: '6px 14px', borderRadius: 999 }}>
                    FREE · HEALTH PARTNER
                  </p>
                  <h2 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(28px, 5vw, 50px)', lineHeight: 1.02, color: '#FFC93C' }}>
                    Free health check-up
                  </h2>
                  <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5 }}>
                    By the doctors of Rainbow Pratiksha Hospital, our Health Partner, at the Rainbow Health Zone.
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: 16, lineHeight: 1.6, flexGrow: 1 }}>
                    <li>For children, both days</li>
                    <li>Book a time slot and skip the wait</li>
                    <li>Walk-ins welcome while slots last</li>
                  </ul>
                  <a href="#family" style={{ background: '#FFC93C', color: '#1A0F0C', fontSize: 16, padding: '14px 24px', boxShadow: '0 5px 0 #1A0F0C', minHeight: 46, borderRadius: 999, textDecoration: 'none', fontWeight: 900, fontFamily: 'inherit', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center' }}>
                    Book a free check-up
                  </a>
                </div>

                <div style={{ flex: '1 1 300px', minWidth: 0, background: '#FFC93C', color: '#1A0F0C', borderRadius: 'clamp(20px, 4vw, 32px)', padding: 'clamp(24px, 5vw, 40px)', boxShadow: '0 8px 0 #1A0F0C', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ margin: 0, alignSelf: 'flex-start', background: '#7A1F2B', color: '#FFF7EE', fontWeight: 900, letterSpacing: 2, fontSize: 13, padding: '6px 14px', borderRadius: 999 }}>
                    FREE · OFFICIAL MUSIC PARTNER
                  </p>
                  <h2 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(28px, 5vw, 50px)', lineHeight: 1.02, color: '#7A1F2B' }}>
                    Try a music instrument
                  </h2>
                  <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5 }}>
                    Ukulele, drums, keyboard, guitar and more, with the team from XPO Music, our Official Music Partner.
                  </p>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: 16, lineHeight: 1.6, flexGrow: 1 }}>
                    <li>For all ages, both days</li>
                    <li>Book a time slot with your pass</li>
                    <li>Walk-ins welcome while slots last</li>
                  </ul>
                  <a href="#family" style={{ background: '#7A1F2B', color: '#FFF7EE', fontSize: 16, padding: '14px 24px', boxShadow: '0 5px 0 #1A0F0C', minHeight: 46, borderRadius: 999, textDecoration: 'none', fontWeight: 900, fontFamily: 'inherit', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center' }}>
                    Book a free slot
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Family Pass Builder */}
          <section id="family" style={{ background: '#FFF1D6', padding: 'clamp(48px, 8vw, 96px) 16px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 13, color: '#7A1F2B' }}>GET YOUR FAMILY PASS</p>
                <h2 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(32px, 6vw, 68px)', lineHeight: 1.05, color: '#7A1F2B' }}>
                  One pass. No queues. Everything sorted.
                </h2>
                <p style={{ margin: 0, fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.5, maxWidth: 820 }}>
                  Your family pass is free. Book the free health check-up, Try a Music Instrument and every activity in one go, and soon you’ll be able to add park tickets to skip the queue. Paid activities are + 18% GST, shown at checkout. Every booking comes as a QR ticket on your email and WhatsApp.
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-start' }}>
                {/* Left: Interactive Checklist */}
                <div style={{ flex: '999 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: '#7A1F2B', color: '#FFF7EE', borderRadius: 20, padding: '18px 20px', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <p style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>Family pass</p>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.4, color: '#F5DCC8' }}>
                        Hourly lucky draw, passport trail and Coolest School points
                      </p>
                    </div>
                    <p style={{ margin: 0, background: '#FFC93C', color: '#1A0F0C', fontWeight: 900, fontSize: 13, padding: '5px 12px', borderRadius: 999 }}>
                      FREE · INCLUDED
                    </p>
                  </div>

                  {passItems.map((item) => (
                    <div
                      key={item.id}
                      style={{ background: '#FFF7EE', borderRadius: 20, padding: '16px 18px', boxShadow: '0 5px 0 #1A0F0C', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}
                    >
                      <label style={{ flex: '1 1 200px', minWidth: 0, display: 'flex', gap: 12, alignItems: 'flex-start', cursor: item.soon || item.full ? 'not-allowed' : 'pointer', opacity: item.soon || item.full ? 0.65 : 1 }}>
                        <input
                          type="checkbox"
                          checked={item.checked}
                          disabled={item.soon || item.full}
                          onChange={item.toggle}
                          style={{ width: 24, height: 24, marginTop: 2, flexShrink: 0, accentColor: '#7A1F2B' }}
                        />
                        <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span style={{ fontSize: 18, fontWeight: 900, color: '#7A1F2B', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            {item.name}
                            {item.full && (
                              <span style={{ background: '#1A0F0C', color: '#FF6B6B', fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 999, letterSpacing: 1 }}>
                                SOLD OUT
                              </span>
                            )}
                          </span>
                          <span style={{ fontSize: 14, lineHeight: 1.4, color: '#5A4038' }}>
                            {item.full ? `${item.desc} · Online registrations full` : item.soon ? `${item.desc} · Coming soon` : item.desc}
                          </span>
                        </span>
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        {item.showQty && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <button
                              type="button"
                              aria-label={`Fewer ${item.units || ''}`}
                              onClick={item.dec}
                              style={{ width: 40, height: 40, borderRadius: 999, border: '2px solid #1A0F0C', background: '#FFFFFF', color: '#1A0F0C', fontSize: 20, fontWeight: 900, fontFamily: 'inherit', cursor: 'pointer' }}
                            >
                              −
                            </button>
                            <span style={{ minWidth: 64, textAlign: 'center', fontSize: 15, fontWeight: 800 }}>
                              {item.qtyText}
                            </span>
                            <button
                              type="button"
                              aria-label={`More ${item.units || ''}`}
                              onClick={item.inc}
                              style={{ width: 40, height: 40, borderRadius: 999, border: '2px solid #1A0F0C', background: '#FFC93C', color: '#1A0F0C', fontSize: 20, fontWeight: 900, fontFamily: 'inherit', cursor: 'pointer' }}
                            >
                              +
                            </button>
                          </div>
                        )}
                        <p style={{ margin: 0, minWidth: 84, textAlign: 'right', fontSize: 17, fontWeight: 900, color: '#7A1F2B' }}>
                          {item.priceText}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right: Pass summary & details form */}
                <div style={{ flex: '1 1 300px', minWidth: 0, background: '#FFF7EE', borderRadius: 'clamp(20px, 4vw, 28px)', padding: 'clamp(20px, 4vw, 28px)', boxShadow: '0 8px 0 #1A0F0C', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h3 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(26px, 5vw, 32px)', color: '#7A1F2B' }}>
                    Your pass
                  </h3>

                  {familySuccess && (
                    <div style={{ background: '#FFC93C', color: '#1A0F0C', padding: '14px', borderRadius: 14, fontWeight: 800, fontSize: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>✓ {familySuccess}</div>
                      {familyPassId && (
                        <a
                          href={`/pass/${encodeURIComponent(familyPassId)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#1A0F0C',
                            color: '#FFFFFF',
                            textDecoration: 'none',
                            fontWeight: 900,
                            padding: '10px 18px',
                            borderRadius: 999,
                            fontSize: 13,
                          }}
                        >
                          View &amp; Download Digital QR Pass →
                        </a>
                      )}
                    </div>
                  )}
                  {familyError && (
                    <div style={{ background: '#FF6B2C', color: '#FFF7EE', padding: '12px 14px', borderRadius: 12, fontWeight: 800, fontSize: 14 }}>
                      ⚠️ {familyError}
                    </div>
                  )}

                  <form onSubmit={handleFamilySubmit} aria-label="Family pass details" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <label htmlFor="f-name" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14 }}>
                      Your name
                      <input
                        id="f-name"
                        type="text"
                        placeholder="Full name"
                        value={familyForm.name}
                        onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                        required
                      />
                    </label>
                    <label htmlFor="f-email" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14 }}>
                      Email address *
                      <input
                        id="f-email"
                        type="email"
                        placeholder="you@example.com"
                        value={familyForm.email}
                        onChange={(e) => setFamilyForm({ ...familyForm, email: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                        required
                      />
                    </label>
                    <label htmlFor="f-phone" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14 }}>
                      WhatsApp number
                      <input
                        id="f-phone"
                        type="tel"
                        placeholder="+91"
                        value={familyForm.phone}
                        onChange={(e) => setFamilyForm({ ...familyForm, phone: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                        required
                      />
                    </label>
                    <label htmlFor="f-school" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14 }}>
                      Your child’s school (for Coolest School points)
                      <input
                        id="f-school"
                        type="text"
                        placeholder="School name"
                        value={familyForm.school}
                        onChange={(e) => setFamilyForm({ ...familyForm, school: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                      />
                    </label>

                    <div style={{ borderTop: '2px dashed #7A1F2B', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 15 }}>
                        <span>Family pass</span>
                        <span style={{ fontWeight: 800 }}>Free</span>
                      </div>
                      {passLines.map((line, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 15 }}>
                          <span>{line.label}</span>
                          <span style={{ fontWeight: 800 }}>{line.amount}</span>
                        </div>
                      ))}
                      {hasGst && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 15 }}>
                          <span>GST (18%)</span>
                          <span style={{ fontWeight: 800 }}>{gstText}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginTop: 4 }}>
                        <span style={{ fontSize: 18, fontWeight: 900 }}>Total</span>
                        <span style={{ fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(32px, 6vw, 40px)', color: '#7A1F2B' }}>
                          {totalText}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={familySubmitting}
                      style={{ background: '#7A1F2B', color: '#FFF7EE', fontSize: 17, padding: '14px 24px', boxShadow: '0 5px 0 #1A0F0C', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: 48, borderRadius: 999, fontWeight: 900, fontFamily: 'inherit', cursor: familySubmitting ? 'not-allowed' : 'pointer', width: '100%' }}
                    >
                      {familySubmitting ? 'Registering...' : passCtaText}
                    </button>
                  </form>

                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: '#5A4038' }}>
                    One QR ticket for each booking, sent to your email and WhatsApp. Show it at the gate and at each activity. Anyone under 18 takes part with a parent or guardian’s consent.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Coolest School Championship */}
          <section id="schools" style={{ background: '#FFC93C', padding: 'clamp(48px, 8vw, 96px) 16px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', textAlign: 'center' }}>
                <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 13, color: '#7A1F2B' }}>THE COOLEST SCHOOL CHAMPIONSHIP</p>
                <h2 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(34px, 7vw, 96px)', lineHeight: 1, color: '#7A1F2B', maxWidth: 1000 }}>
                  Who will be Guwahati’s Coolest School?
                </h2>
                <p style={{ margin: 0, fontSize: 'clamp(17px, 2.8vw, 21px)', lineHeight: 1.5, maxWidth: 760 }}>
                  Free entry for schools. Only 20 places. 6 championships, 10 categories, one trophy, presented by Prag News. Students: come in your school ID or T-shirt, because every student who turns up adds to your school’s score.
                </p>
              </div>

              {/* 6 Category Badges: Fits 2 columns cleanly on mobile */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 10 }}>
                <div style={{ background: '#FFF7EE', borderRadius: 18, padding: '14px 16px', boxShadow: '0 5px 0 #1A0F0C' }}>
                  <h3 style={{ margin: 0, fontSize: 17, color: '#7A1F2B' }}>Inter-School Quiz</h3>
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: '#5A4038' }}>Junior · Senior</p>
                </div>
                <div style={{ background: '#FFF7EE', borderRadius: 18, padding: '14px 16px', boxShadow: '0 5px 0 #1A0F0C' }}>
                  <h3 style={{ margin: 0, fontSize: 17, color: '#7A1F2B' }}>Group Dance</h3>
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: '#5A4038' }}>One school team</p>
                </div>
                <div style={{ background: '#FFF7EE', borderRadius: 18, padding: '14px 16px', boxShadow: '0 5px 0 #1A0F0C' }}>
                  <h3 style={{ margin: 0, fontSize: 17, color: '#7A1F2B' }}>Choir or Band</h3>
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: '#5A4038' }}>One school team</p>
                </div>
                <div style={{ background: '#FFF7EE', borderRadius: 18, padding: '14px 16px', boxShadow: '0 5px 0 #1A0F0C' }}>
                  <h3 style={{ margin: 0, fontSize: 17, color: '#7A1F2B' }}>On-the-spot Art</h3>
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: '#5A4038' }}>Junior · Senior</p>
                </div>
                <div style={{ background: '#FFF7EE', borderRadius: 18, padding: '14px 16px', boxShadow: '0 5px 0 #1A0F0C' }}>
                  <h3 style={{ margin: 0, fontSize: 17, color: '#7A1F2B' }}>Little Mayor</h3>
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: '#5A4038' }}>Junior · Senior</p>
                </div>
                <div style={{ background: '#FFF7EE', borderRadius: 18, padding: '14px 16px', boxShadow: '0 5px 0 #1A0F0C' }}>
                  <h3 style={{ margin: 0, fontSize: 17, color: '#7A1F2B' }}>Science &amp; Robotics</h3>
                  <p style={{ margin: '3px 0 0', fontSize: 13, color: '#5A4038' }}>Junior · Senior</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ flex: '1 1 280px', minWidth: 0, background: '#7A1F2B', color: '#FFF7EE', borderRadius: 24, padding: 'clamp(20px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(24px, 4vw, 30px)', color: '#FFC93C' }}>
                    The Coolest School wins
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: 16, lineHeight: 1.6 }}>
                    <li>The rotating Coolest School Trophy, presented by Prag News</li>
                    <li>A “Coolest School of Guwahati 2026” gate plaque</li>
                    <li>A celebration at school on 17 November</li>
                  </ul>
                </div>
                <div style={{ flex: '1 1 280px', minWidth: 0, background: '#FFF7EE', borderRadius: 24, padding: 'clamp(20px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(24px, 4vw, 30px)', color: '#7A1F2B' }}>
                    Every category has a podium
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: 16, lineHeight: 1.6 }}>
                    <li>10 categories, 10 winner trophies</li>
                    <li>Gold, silver and bronze medals and certificates</li>
                    <li>A digital certificate for every competitor</li>
                  </ul>
                </div>
                <div style={{ flex: '1 1 280px', minWidth: 0, background: '#FFF7EE', borderRadius: 24, padding: 'clamp(20px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(24px, 4vw, 30px)', color: '#7A1F2B' }}>
                    Fair for every school
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: 20, fontSize: 16, lineHeight: 1.6 }}>
                    <li>Points from results, turnout and school spirit</li>
                    <li>Best placing per category; best 4 count</li>
                    <li>Three judges per category, results in the open</li>
                  </ul>
                  <a href="#schools" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '8px 18px', boxSizing: 'border-box', borderRadius: 999, border: '2px solid #7A1F2B', color: '#7A1F2B', textDecoration: 'none', fontWeight: 900, fontSize: 15 }}>
                    Read the full rules
                  </a>
                </div>
              </div>

              {/* School Registration Form */}
              <div id="school-form" style={{ background: '#FFF7EE', borderRadius: 'clamp(20px, 4vw, 32px)', padding: 'clamp(20px, 5vw, 36px)', boxShadow: '0 8px 0 #1A0F0C', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                <div style={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 13, color: '#7A1F2B' }}>FOR PRINCIPALS AND SCHOOL TEAMS</p>
                  <h3 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1.05, color: '#7A1F2B' }}>
                    Register your school, free
                  </h3>
                  <p style={{ margin: 0, fontSize: 'clamp(15px, 2.5vw, 18px)', lineHeight: 1.5 }}>
                    Entry is free: your students compete in any three of the six championships. Want more? Choose a package for all six championships, stage time and admissions space in front of Guwahati’s parents. Our team confirms your place within one working day.
                  </p>
                  <a href="#schools" style={{ color: '#7A1F2B', fontWeight: 900, fontSize: 15 }}>
                    Rules, teams, judging and prizes
                  </a>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#5A4038' }}>
                    Packages from ₹20,000 + GST · 10% off any package till 31 October · Admissions space comes with a package
                  </p>
                </div>

                <form onSubmit={handleSchoolSubmit} aria-label="Register your school" style={{ flex: '2 1 320px', minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  {schoolSuccess && (
                    <div style={{ gridColumn: '1 / -1', background: '#FFC93C', color: '#1A0F0C', padding: '12px 16px', borderRadius: 12, fontWeight: 800, fontSize: 15 }}>
                      ✓ {schoolSuccess}
                    </div>
                  )}
                  {schoolError && (
                    <div style={{ gridColumn: '1 / -1', background: '#FF6B2C', color: '#FFF7EE', padding: '12px 16px', borderRadius: 12, fontWeight: 800, fontSize: 15 }}>
                      ⚠️ {schoolError}
                    </div>
                  )}

                  <label htmlFor="s-name" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14 }}>
                    School name
                    <input
                      id="s-name"
                      type="text"
                      placeholder="School name"
                      value={schoolForm.name}
                      onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                      required
                    />
                  </label>

                  <label htmlFor="s-type" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14 }}>
                    Your entry
                    <select
                      id="s-type"
                      value={schoolForm.type}
                      onChange={(e) => setSchoolForm({ ...schoolForm, type: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                    >
                      <option>Invited · Free · 3 of 6 championships</option>
                      <option>Participant · ₹20,000 + GST · 3 championships, Pavilion table and own 10×10 stall</option>
                      <option>Champion · ₹40,000 + GST · all 6 championships, own 10×10 stall, creator reel (most popular)</option>
                      <option>Spotlight · ₹60,000 + GST · plus 10-min showcase, prime stall, press meet panel (5 places)</option>
                      <option>Signature · ₹1,00,000 + GST · plus 15-min showcase, 20×20 Experience Zone, main-stage talk (1 place)</option>
                    </select>
                  </label>

                  <label htmlFor="s-contact" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14 }}>
                    Your name
                    <input
                      id="s-contact"
                      type="text"
                      placeholder="Full name"
                      value={schoolForm.contact}
                      onChange={(e) => setSchoolForm({ ...schoolForm, contact: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                      required
                    />
                  </label>

                  <label htmlFor="s-role" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14 }}>
                    Your role
                    <input
                      id="s-role"
                      type="text"
                      placeholder="Principal, admin, marketing…"
                      value={schoolForm.role}
                      onChange={(e) => setSchoolForm({ ...schoolForm, role: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                    />
                  </label>

                  <label htmlFor="s-phone" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14 }}>
                    Phone or WhatsApp
                    <input
                      id="s-phone"
                      type="tel"
                      placeholder="+91"
                      value={schoolForm.phone}
                      onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                      required
                    />
                  </label>

                  <label htmlFor="s-email" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14 }}>
                    Email address *
                    <input
                      id="s-email"
                      type="email"
                      placeholder="name@school.edu.in"
                      value={schoolForm.email}
                      onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                      required
                    />
                  </label>

                  <label htmlFor="s-msg" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14, gridColumn: '1 / -1' }}>
                    Championships you’d like to enter (optional)
                    <textarea
                      id="s-msg"
                      rows={3}
                      placeholder="For example: Quiz, Group Dance, Little Mayor"
                      value={schoolForm.msg}
                      onChange={(e) => setSchoolForm({ ...schoolForm, msg: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 88, resize: 'vertical' }}
                    ></textarea>
                  </label>

                  <button
                    type="submit"
                    disabled={schoolSubmitting}
                    style={{ background: '#7A1F2B', color: '#FFF7EE', fontWeight: 900, fontSize: 17, padding: '14px 24px', borderRadius: 999, boxShadow: '0 5px 0 #1A0F0C', border: 'none', fontFamily: 'inherit', cursor: schoolSubmitting ? 'not-allowed' : 'pointer', minHeight: 48, gridColumn: '1 / -1', justifySelf: 'start', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {schoolSubmitting ? 'Registering...' : 'Register my school'}
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* What’s On */}
          <section id="whatson" style={{ padding: 'clamp(48px, 8vw, 96px) 16px 48px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 13, color: '#7A1F2B' }}>WHAT’S ON</p>
                <h2 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(30px, 5vw, 60px)', lineHeight: 1.05, color: '#7A1F2B' }}>
                  Everything else at the festival
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div style={{ background: '#FFF1D6', borderRadius: 20, padding: 20, borderTop: '6px solid #7A1F2B', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ margin: 0, alignSelf: 'flex-start', background: '#7A1F2B', color: '#FFF7EE', fontWeight: 900, fontSize: 12, padding: '4px 10px', borderRadius: 999 }}>FREE</p>
                  <h3 style={{ margin: 0, fontSize: 20, color: '#7A1F2B' }}>Free kids’ health check-ups</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>By Rainbow Pratiksha Hospital, our Health Partner, both days.</p>
                </div>
                <div style={{ background: '#FFF1D6', borderRadius: 20, padding: 20, borderTop: '6px solid #7A1F2B', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ margin: 0, alignSelf: 'flex-start', background: '#7A1F2B', color: '#FFF7EE', fontWeight: 900, fontSize: 12, padding: '4px 10px', borderRadius: 999 }}>FREE</p>
                  <h3 style={{ margin: 0, fontSize: 20, color: '#7A1F2B' }}>Try a real instrument</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>Ukulele, drums, keyboard and more with XPO Music, our Official Music Partner.</p>
                </div>
                <div style={{ background: '#FFF1D6', borderRadius: 20, padding: 20, borderTop: '6px solid #7A1F2B', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ margin: 0, alignSelf: 'flex-start', background: '#FFC93C', color: '#1A0F0C', fontWeight: 900, fontSize: 12, padding: '4px 10px', borderRadius: 999 }}>₹199 + GST</p>
                  <h3 style={{ margin: 0, fontSize: 20, color: '#7A1F2B' }}>Kids’ open mic</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>Sing, rap, recite or tell a joke: heats on Saturday, Grand Final on Sunday.</p>
                </div>
                <div style={{ background: '#FFF1D6', borderRadius: 20, padding: 20, borderTop: '6px solid #7A1F2B', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ margin: 0, alignSelf: 'flex-start', background: '#FFC93C', color: '#1A0F0C', fontWeight: 900, fontSize: 12, padding: '4px 10px', borderRadius: 999 }}>₹299 + GST · 40 SEATS</p>
                  <h3 style={{ margin: 0, fontSize: 20, color: '#7A1F2B' }}>AI &amp; Robotics Workshop</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>Hands-on with STEM India. Seats are limited for each session.</p>
                </div>
                <div style={{ background: '#FFF1D6', borderRadius: 20, padding: 20, borderTop: '6px solid #7A1F2B', display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.75 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <p style={{ margin: 0, background: '#1A0F0C', color: '#FF6B6B', fontWeight: 900, fontSize: 11, padding: '4px 10px', borderRadius: 999 }}>SOLD OUT</p>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 20, color: '#7A1F2B' }}>Art Workshop</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>Learn a new technique with a working artist, materials included.</p>
                </div>
                <div style={{ background: '#FFF1D6', borderRadius: 20, padding: 20, borderTop: '6px solid #7A1F2B', display: 'flex', flexDirection: 'column', gap: 6, opacity: 0.75 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <p style={{ margin: 0, background: '#7A1F2B', color: '#FFF7EE', fontWeight: 900, fontSize: 12, padding: '4px 10px', borderRadius: 999 }}>FREE</p>
                    <p style={{ margin: 0, background: '#1A0F0C', color: '#FF6B6B', fontWeight: 900, fontSize: 11, padding: '4px 10px', borderRadius: 999 }}>SOLD OUT</p>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 20, color: '#7A1F2B' }}>Art Competition</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>Draw on the spot, judged by age group, with prizes.</p>
                </div>
                <div style={{ background: '#FFF1D6', borderRadius: 20, padding: 20, borderTop: '6px solid #7A1F2B', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ margin: 0, alignSelf: 'flex-start', background: '#FFC93C', color: '#1A0F0C', fontWeight: 900, fontSize: 12, padding: '4px 10px', borderRadius: 999 }}>REGISTER</p>
                  <h3 style={{ margin: 0, fontSize: 20, color: '#7A1F2B' }}>Baby Crawl Race &amp; Toddler Dash</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>For babies 6–18 months and toddlers 2–4, on the main stage on Sunday.</p>
                </div>
                <div style={{ background: '#FFF1D6', borderRadius: 20, padding: 20, borderTop: '6px solid #7A1F2B', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ margin: 0, alignSelf: 'flex-start', background: '#7A1F2B', color: '#FFF7EE', fontWeight: 900, fontSize: 12, padding: '4px 10px', borderRadius: 999 }}>FREE</p>
                  <h3 style={{ margin: 0, fontSize: 20, color: '#7A1F2B' }}>Best Dressed Family</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>Dress up together. Our judges walk the park and call winners to the stage.</p>
                </div>
                <div style={{ background: '#FFF1D6', borderRadius: 20, padding: 20, borderTop: '6px solid #7A1F2B', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ margin: 0, alignSelf: 'flex-start', background: '#7A1F2B', color: '#FFF7EE', fontWeight: 900, fontSize: 12, padding: '4px 10px', borderRadius: 999 }}>FREE</p>
                  <h3 style={{ margin: 0, fontSize: 20, color: '#7A1F2B' }}>Passport trail &amp; lucky draw</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>Collect stamps around the park and win in our draw, every hour.</p>
                </div>
                <div style={{ background: '#FFF1D6', borderRadius: 20, padding: 20, borderTop: '6px solid #7A1F2B', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ margin: 0, alignSelf: 'flex-start', background: '#7A1F2B', color: '#FFF7EE', fontWeight: 900, fontSize: 12, padding: '4px 10px', borderRadius: 999 }}>FREE</p>
                  <h3 style={{ margin: 0, fontSize: 20, color: '#7A1F2B' }}>Food Street &amp; market</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>Bakers, cafés, treats, books and toys. Entry is free; food is paid at the stalls.</p>
                </div>
              </div>
            </div>
          </section>

          {/* The Weekend Schedule */}
          <section id="weekend" style={{ padding: 'clamp(48px, 8vw, 96px) 16px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 13, color: '#7A1F2B' }}>THE WEEKEND</p>
                <h2 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(30px, 5vw, 60px)', lineHeight: 1.05, color: '#7A1F2B' }}>
                  Two big days on the main stage
                </h2>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
                <div style={{ flex: '1 1 300px', minWidth: 0, background: '#FFF1D6', borderRadius: 24, padding: 'clamp(20px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(26px, 4.5vw, 34px)', color: '#7A1F2B' }}>Saturday 14 Nov</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <p style={{ margin: 0, fontWeight: 900, color: '#7A1F2B', fontSize: 14, letterSpacing: 2 }}>AFTERNOON</p>
                    <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>Festival opens · Art and AI &amp; Robotics Workshops · Open mic heats</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <p style={{ margin: 0, fontWeight: 900, color: '#7A1F2B', fontSize: 14, letterSpacing: 2 }}>EVENING</p>
                    <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>Group Dance Championship · School showcases · Day 1 Coolest School leaderboard</p>
                  </div>
                </div>
                <div style={{ flex: '1 1 300px', minWidth: 0, background: '#7A1F2B', color: '#FFF7EE', borderRadius: 24, padding: 'clamp(20px, 4vw, 32px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <p style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(26px, 4.5vw, 34px)', color: '#FFC93C' }}>Sunday 15 Nov</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <p style={{ margin: 0, fontWeight: 900, color: '#FFC93C', fontSize: 14, letterSpacing: 2 }}>AFTERNOON</p>
                    <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>Crawl Race &amp; Toddler Dash · Quiz finals · Choir or Band Championship · Science &amp; Robotics judging</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <p style={{ margin: 0, fontWeight: 900, color: '#FFC93C', fontSize: 14, letterSpacing: 2 }}>EVENING</p>
                    <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>Little Mayor finals · Open mic Grand Final · Crowning the Coolest School of Guwahati</p>
                  </div>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 15, color: '#5A4038' }}>
                Free health check-ups, Try a Music Instrument, the Art Competition, Food Street and the passport trail run all day, both days.
              </p>
            </div>
          </section>

          {/* Partners */}
          <section id="partners" style={{ padding: 'clamp(48px, 8vw, 96px) 16px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 13, color: '#7A1F2B' }}>OUR PARTNERS</p>
                <h2 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(30px, 5vw, 60px)', lineHeight: 1.05, color: '#7A1F2B' }}>
                  Made possible by
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                <div style={{ border: '2.5px solid #1A0F0C', borderRadius: 18, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4, background: '#FFF7EE' }}>
                  <p style={{ margin: 0, fontWeight: 900, letterSpacing: 1.5, fontSize: 12, color: '#7A1F2B' }}>MEDIA PARTNER</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Prag News</p>
                </div>
                <div style={{ border: '2.5px solid #1A0F0C', borderRadius: 18, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4, background: '#FFF7EE' }}>
                  <p style={{ margin: 0, fontWeight: 900, letterSpacing: 1.5, fontSize: 12, color: '#7A1F2B' }}>RADIO PARTNER</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Gup Shup Radio</p>
                </div>
                <div style={{ border: '2.5px solid #1A0F0C', borderRadius: 18, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4, background: '#FFF7EE' }}>
                  <p style={{ margin: 0, fontWeight: 900, letterSpacing: 1.5, fontSize: 12, color: '#7A1F2B' }}>HEALTH PARTNER</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Rainbow Pratiksha</p>
                </div>
                <div style={{ border: '2.5px solid #1A0F0C', borderRadius: 18, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4, background: '#FFF7EE' }}>
                  <p style={{ margin: 0, fontWeight: 900, letterSpacing: 1.5, fontSize: 12, color: '#7A1F2B' }}>MUSIC PARTNER</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>XPO Music</p>
                </div>
                <div style={{ border: '2.5px solid #1A0F0C', borderRadius: 18, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4, background: '#FFF7EE' }}>
                  <p style={{ margin: 0, fontWeight: 900, letterSpacing: 1.5, fontSize: 12, color: '#7A1F2B' }}>WORKSHOP</p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>STEM India</p>
                </div>
                <div style={{ border: '2.5px dashed #7A1F2B', borderRadius: 18, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6, background: '#FFF1D6' }}>
                  <p style={{ margin: 0, fontWeight: 900, letterSpacing: 1.5, fontSize: 12, color: '#7A1F2B' }}>YOUR BRAND</p>
                  <a href="#workwithus" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', minHeight: 38, padding: '6px 16px', boxSizing: 'border-box', borderRadius: 999, background: '#7A1F2B', color: '#FFF7EE', textDecoration: 'none', fontWeight: 900, fontSize: 14 }}>
                    Partner
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Book a Stall */}
          <section id="stalls" style={{ padding: 'clamp(48px, 8vw, 96px) 16px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 13, color: '#7A1F2B' }}>BOOK A STALL</p>
                <h2 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(32px, 6vw, 68px)', lineHeight: 1.05, color: '#7A1F2B' }}>
                  Sell to Guwahati’s families
                </h2>
                <p style={{ margin: 0, fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.5, maxWidth: 820 }}>
                  Two days, noon to 8 PM, with families and up to 20 schools in one park. Food Street for bakers, cafés and snacks; the market lane for books, toys, clothes and stationery.
                </p>
              </div>

              <h3 style={{ margin: 0, fontSize: 'clamp(22px, 4vw, 26px)', color: '#7A1F2B' }}>Food Street</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
                <div style={{ background: '#FFF7EE', borderRadius: 24, padding: 'clamp(20px, 4vw, 28px)', boxShadow: '0 6px 0 #1A0F0C', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 12, color: '#7A1F2B' }}>FOOD STALL</p>
                  <p style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(32px, 6vw, 40px)', lineHeight: 1, color: '#7A1F2B' }}>10×10 ft</p>
                  <p style={{ margin: 0, fontSize: 'clamp(24px, 4.5vw, 28px)', fontWeight: 900 }}>₹12,000 <span style={{ fontSize: 15, fontWeight: 700, color: '#5A4038' }}>+ GST, for both days</span></p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 15, lineHeight: 1.6, flexGrow: 1 }}>
                    <li>Your own stall on Food Street</li>
                    <li>Power point and lights</li>
                    <li>Listed on the festival map</li>
                  </ul>
                  <button type="button" onClick={() => { setStallForm(prev => ({ ...prev, type: 'Food stall · 10×10 ft · ₹12,000 + GST' })); setPopupModal('stall'); }} style={{ background: '#7A1F2B', color: '#FFF7EE', fontSize: 16, padding: '12px 22px', boxShadow: '0 5px 0 #1A0F0C', minHeight: 46, borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 900, fontFamily: 'inherit', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center' }}>
                    Book this stall
                  </button>
                </div>
                <div style={{ background: '#FFF7EE', borderRadius: 24, padding: 'clamp(20px, 4vw, 28px)', boxShadow: '0 6px 0 #1A0F0C', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 12, color: '#7A1F2B' }}>FOOD STALL · COMPACT</p>
                  <p style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(32px, 6vw, 40px)', lineHeight: 1, color: '#7A1F2B' }}>5×10 ft</p>
                  <p style={{ margin: 0, fontSize: 'clamp(24px, 4.5vw, 28px)', fontWeight: 900 }}>₹5,000 <span style={{ fontSize: 15, fontWeight: 700, color: '#5A4038' }}>+ GST, for both days</span></p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 15, lineHeight: 1.6, flexGrow: 1 }}>
                    <li>A half-size stall for one counter</li>
                    <li>Power point and lights</li>
                    <li>Listed on the festival map</li>
                  </ul>
                  <button type="button" onClick={() => { setStallForm(prev => ({ ...prev, type: 'Food stall · 5×10 ft · ₹5,000 + GST' })); setPopupModal('stall'); }} style={{ background: '#7A1F2B', color: '#FFF7EE', fontSize: 16, padding: '12px 22px', boxShadow: '0 5px 0 #1A0F0C', minHeight: 46, borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 900, fontFamily: 'inherit', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center' }}>
                    Book this stall
                  </button>
                </div>
              </div>

              <h3 style={{ margin: '12px 0 0', fontSize: 'clamp(22px, 4vw, 26px)', color: '#7A1F2B' }}>Market lane</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
                <div style={{ background: '#FFF7EE', borderRadius: 24, padding: 'clamp(20px, 4vw, 28px)', boxShadow: '0 6px 0 #1A0F0C', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 12, color: '#7A1F2B' }}>SHOPPING · SHARED</p>
                  <p style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(32px, 6vw, 40px)', lineHeight: 1, color: '#7A1F2B' }}>5×10 ft</p>
                  <p style={{ margin: 0, fontSize: 'clamp(24px, 4.5vw, 28px)', fontWeight: 900 }}>₹7,000 <span style={{ fontSize: 15, fontWeight: 700, color: '#5A4038' }}>+ GST, for both days</span></p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 15, lineHeight: 1.6, flexGrow: 1 }}>
                    <li>Half of a shared 10×10 stall</li>
                    <li>Power point and lights</li>
                    <li>Listed on the festival map</li>
                  </ul>
                  <button type="button" onClick={() => { setStallForm(prev => ({ ...prev, type: 'Shopping stall · 5×10 ft shared · ₹7,000 + GST' })); setPopupModal('stall'); }} style={{ background: '#7A1F2B', color: '#FFF7EE', fontSize: 16, padding: '12px 22px', boxShadow: '0 5px 0 #1A0F0C', minHeight: 46, borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 900, fontFamily: 'inherit', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center' }}>
                    Book this stall
                  </button>
                </div>
                <div style={{ background: '#FFF7EE', borderRadius: 24, padding: 'clamp(20px, 4vw, 28px)', boxShadow: '0 6px 0 #1A0F0C', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 12, color: '#7A1F2B' }}>SHOPPING STALL</p>
                  <p style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(32px, 6vw, 40px)', lineHeight: 1, color: '#7A1F2B' }}>10×10 ft</p>
                  <p style={{ margin: 0, fontSize: 'clamp(24px, 4.5vw, 28px)', fontWeight: 900 }}>₹15,000 <span style={{ fontSize: 15, fontWeight: 700, color: '#5A4038' }}>+ GST, for both days</span></p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 15, lineHeight: 1.6, flexGrow: 1 }}>
                    <li>Your own stall on the market lane</li>
                    <li>Power point and lights</li>
                    <li>Listed on the festival map</li>
                  </ul>
                  <button type="button" onClick={() => { setStallForm(prev => ({ ...prev, type: 'Shopping stall · 10×10 ft · ₹15,000 + GST' })); setPopupModal('stall'); }} style={{ background: '#7A1F2B', color: '#FFF7EE', fontSize: 16, padding: '12px 22px', boxShadow: '0 5px 0 #1A0F0C', minHeight: 46, borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 900, fontFamily: 'inherit', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center' }}>
                    Book this stall
                  </button>
                </div>
                <div style={{ background: '#FFF7EE', borderRadius: 24, padding: 'clamp(20px, 4vw, 28px)', boxShadow: '0 6px 0 #1A0F0C', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ margin: 0, fontWeight: 900, letterSpacing: 2, fontSize: 12, color: '#7A1F2B' }}>SHOPPING · LARGE</p>
                  <p style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 'clamp(32px, 6vw, 40px)', lineHeight: 1, color: '#7A1F2B' }}>20×10 ft</p>
                  <p style={{ margin: 0, fontSize: 'clamp(24px, 4.5vw, 28px)', fontWeight: 900 }}>₹30,000 <span style={{ fontSize: 15, fontWeight: 700, color: '#5A4038' }}>+ GST, for both days</span></p>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 15, lineHeight: 1.6, flexGrow: 1 }}>
                    <li>A double-width stall for a full display</li>
                    <li>Power point and lights</li>
                    <li>Featured on the festival map</li>
                  </ul>
                  <button type="button" onClick={() => { setStallForm(prev => ({ ...prev, type: 'Shopping stall · 20×10 ft · ₹30,000 + GST' })); setPopupModal('stall'); }} style={{ background: '#7A1F2B', color: '#FFF7EE', fontSize: 16, padding: '12px 22px', boxShadow: '0 5px 0 #1A0F0C', minHeight: 46, borderRadius: 999, border: 'none', cursor: 'pointer', fontWeight: 900, fontFamily: 'inherit', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center' }}>
                    Book this stall
                  </button>
                </div>
              </div>

              {/* Stall Booking Form */}
              <div id="stall-form" style={{ background: '#7A1F2B', color: '#FFF7EE', borderRadius: 'clamp(20px, 4vw, 32px)', padding: 'clamp(20px, 5vw, 36px)', display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                <div style={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <h3 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(28px, 5vw, 40px)', lineHeight: 1.05, color: '#FFC93C' }}>
                    Book your stall
                  </h3>
                  <p style={{ margin: 0, fontSize: 'clamp(15px, 2.5vw, 18px)', lineHeight: 1.5 }}>
                    Send your details and we’ll call to confirm your spot. Stalls are allotted in the order they are paid. All prices + 18% GST.
                  </p>
                </div>

                <form onSubmit={handleStallSubmit} aria-label="Book a stall" style={{ flex: '2 1 320px', minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  {stallSuccess && (
                    <div style={{ gridColumn: '1 / -1', background: '#FFC93C', color: '#1A0F0C', padding: '12px 16px', borderRadius: 12, fontWeight: 800, fontSize: 15 }}>
                      ✓ {stallSuccess}
                    </div>
                  )}
                  {stallError && (
                    <div style={{ gridColumn: '1 / -1', background: '#FF6B2C', color: '#FFF7EE', padding: '12px 16px', borderRadius: 12, fontWeight: 800, fontSize: 15 }}>
                      ⚠️ {stallError}
                    </div>
                  )}

                  <label htmlFor="st-biz" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14 }}>
                    Business name
                    <input
                      id="st-biz"
                      type="text"
                      placeholder="Your brand or shop"
                      value={stallForm.biz}
                      onChange={(e) => setStallForm({ ...stallForm, biz: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                      required
                    />
                  </label>

                  <label htmlFor="st-type" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14 }}>
                    Stall
                    <select
                      id="st-type"
                      value={stallForm.type}
                      onChange={(e) => setStallForm({ ...stallForm, type: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                    >
                      <option>Food stall · 10×10 ft · ₹12,000 + GST</option>
                      <option>Food stall · 5×10 ft · ₹5,000 + GST</option>
                      <option>Shopping stall · 5×10 ft shared · ₹7,000 + GST</option>
                      <option>Shopping stall · 10×10 ft · ₹15,000 + GST</option>
                      <option>Shopping stall · 20×10 ft · ₹30,000 + GST</option>
                    </select>
                  </label>

                  <label htmlFor="st-name" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14 }}>
                    Your name
                    <input
                      id="st-name"
                      type="text"
                      placeholder="Full name"
                      value={stallForm.name}
                      onChange={(e) => setStallForm({ ...stallForm, name: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                      required
                    />
                  </label>

                  <label htmlFor="st-phone" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14 }}>
                    Phone or WhatsApp
                    <input
                      id="st-phone"
                      type="tel"
                      placeholder="+91"
                      value={stallForm.phone}
                      onChange={(e) => setStallForm({ ...stallForm, phone: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                      required
                    />
                  </label>

                  <label htmlFor="st-email" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14 }}>
                    Email address *
                    <input
                      id="st-email"
                      type="email"
                      placeholder="you@example.com"
                      value={stallForm.email}
                      onChange={(e) => setStallForm({ ...stallForm, email: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                      required
                    />
                  </label>

                  <label htmlFor="st-sell" style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 14 }}>
                    What will you sell?
                    <input
                      id="st-sell"
                      type="text"
                      placeholder="Cakes, books, toys…"
                      value={stallForm.sell}
                      onChange={(e) => setStallForm({ ...stallForm, sell: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 16, padding: '12px 14px', border: '2px solid #1A0F0C', borderRadius: 12, background: '#FFFFFF', color: '#1A0F0C', minHeight: 48 }}
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={stallSubmitting}
                    style={{ background: '#FFC93C', color: '#1A0F0C', fontSize: 17, padding: '14px 24px', boxShadow: '0 5px 0 #1A0F0C', border: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: 48, borderRadius: 999, fontWeight: 900, fontFamily: 'inherit', cursor: stallSubmitting ? 'not-allowed' : 'pointer', gridColumn: '1 / -1', justifySelf: 'start' }}
                  >
                    {stallSubmitting ? 'Sending...' : 'Send booking request'}
                  </button>
                </form>
              </div>
            </div>
          </section>

          {/* Volunteer & Partner */}
          <section id="workwithus" style={{ background: '#FFF1D6', padding: 'clamp(48px, 6vw, 80px) 16px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1.05, color: '#7A1F2B' }}>
                Be part of the festival
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                <div style={{ background: '#FFF7EE', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 5px 0 #1A0F0C' }}>
                  <h3 style={{ margin: 0, fontSize: 20, color: '#7A1F2B' }}>Volunteer with us</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, flexGrow: 1 }}>College students: help run Guwahati’s biggest kids’ weekend.</p>
                  <button
                    type="button"
                    onClick={openVendorModal}
                    style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', minHeight: 42, padding: '8px 18px', boxSizing: 'border-box', borderRadius: 999, border: '2px solid #7A1F2B', background: 'transparent', color: '#7A1F2B', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}
                  >
                    Join the crew
                  </button>
                </div>
                <div style={{ background: '#FFF7EE', borderRadius: 20, padding: 20, display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 5px 0 #1A0F0C' }}>
                  <h3 style={{ margin: 0, fontSize: 20, color: '#7A1F2B' }}>Partner with us</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, flexGrow: 1 }}>Brands and media: sponsorship and press passes.</p>
                  <button
                    type="button"
                    onClick={openVendorModal}
                    style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', minHeight: 42, padding: '8px 18px', boxSizing: 'border-box', borderRadius: 999, border: '2px solid #7A1F2B', background: 'transparent', color: '#7A1F2B', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}
                  >
                    Get in touch
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" style={{ background: '#FFF1D6', padding: 'clamp(48px, 8vw, 96px) 16px' }}>
            <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h2 style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontWeight: 400, fontSize: 'clamp(30px, 5vw, 56px)', lineHeight: 1.05, color: '#7A1F2B' }}>
                Good to know
              </h2>
              <div style={{ background: '#FFF7EE', borderRadius: 18, padding: '18px 20px' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#7A1F2B' }}>Is there an entry fee?</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>
                  You pay only the regular park entry ticket, and soon you’ll be able to buy it online with your family pass to skip the queue. The family pass and most activities are free; food and shopping are paid at the stalls.
                </p>
              </div>
              <div style={{ background: '#FFF7EE', borderRadius: 18, padding: '18px 20px' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#7A1F2B' }}>Do we need to register?</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>
                  The free family pass is recommended: it gets you into the lucky draw, counts towards your school’s score and holds all your activity tickets. Some activities have limited places, so book them with your pass.
                </p>
              </div>
              <div style={{ background: '#FFF7EE', borderRadius: 18, padding: '18px 20px' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#7A1F2B' }}>What ages is it for?</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>
                  Babies to teenagers. There is something for every age, from the Crawl Race to the inter-school championships for Class 1 to 10 (Junior: Class 1–7, Senior: Class 8–10).
                </p>
              </div>
              <div style={{ background: '#FFF7EE', borderRadius: 18, padding: '18px 20px' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#7A1F2B' }}>How do we get there?</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>
                  Sati Radhika Shanti Udyan is on the riverfront at Uzan Bazar, Guwahati. Parking is available near the riverfront promenade.
                </p>
              </div>
            </div>
          </section>

          {/* LGF Footer */}
          <footer style={{ background: '#1A0F0C', color: '#FFF7EE', padding: '48px 16px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between' }}>
              <div style={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ margin: 0, fontFamily: "'Bagel Fat One', Arial, sans-serif", fontSize: 26, color: '#FFC93C' }}>
                  Little Guwahati Festival
                </p>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>
                  Organised by City Mela, a unit of YWE Studios (OPC) Pvt Ltd, Guwahati.
                </p>
              </div>
              <div style={{ flex: '1 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 15 }}>
                <p style={{ margin: 0, fontWeight: 900, color: '#FFC93C' }}>Talk to us</p>
                <a href="https://wa.me/919181051445" target="_blank" rel="noopener noreferrer" style={{ color: '#FFF7EE' }}>
                  WhatsApp +91 91810 51445
                </a>
                <a href="mailto:mailcitymela@gmail.com" style={{ color: '#FFF7EE' }}>
                  mailcitymela@gmail.com
                </a>
                <a href="https://www.citymela.space" target="_blank" rel="noopener noreferrer" style={{ color: '#FFF7EE' }}>
                  www.citymela.space
                </a>
              </div>
            </div>
          </footer>
        </main>
      )}

      {/* ============ DISCOUNT DHAMAKA ============ */}
      {activeTab === 'dd' && (
        <main id="top" className="animate-fade-in" style={{ background: '#FFD400', color: '#111', overflowX: 'hidden' }}>
          <section style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(40px, 8vw, 96px) 16px clamp(36px, 6vw, 72px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 'clamp(12px, 2.8vw, 15px)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>City Mela presents</span>
              <span style={{ background: '#111', color: '#FFD400', fontWeight: 800, fontSize: 'clamp(11px, 2.5vw, 13px)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '5px 10px' }}>The Big Shopping Event</span>
            </div>
            <h1 style={{ margin: 0, fontFamily: "'Anton', sans-serif", fontWeight: 400, textTransform: 'uppercase', lineHeight: 0.88, fontSize: 'clamp(52px, 13vw, 190px)', letterSpacing: '-0.01em', wordBreak: 'break-word' }}>
              Discount<br />Dhamaka
            </h1>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 'clamp(18px, 3.2vw, 32px)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Guwahati's Bumper Shopping Festival</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'stretch', marginTop: 12 }}>
              <div style={{ background: '#D10000', color: '#fff', padding: '16px 22px', transform: 'rotate(-2deg)', boxShadow: '6px 6px 0 #111', display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 800, fontSize: 'clamp(16px, 2.5vw, 24px)', textTransform: 'uppercase' }}>Up to</span>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(52px, 10vw, 120px)', lineHeight: 0.9 }}>50% OFF*</span>
              </div>
              <div style={{ flex: '1 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, borderLeft: '4px solid #111', paddingLeft: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Six days only</span>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(28px, 5vw, 54px)', lineHeight: 1 }}>27 Nov – 2 Dec 2026</span>
                <span style={{ fontWeight: 600, fontSize: 15 }}>[VENUE], Guwahati</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
              <button
                type="button"
                id="dd-deal-alerts-btn"
                onClick={openAlertModal}
                style={{ textDecoration: 'none', background: '#111', color: '#FFD400', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '14px 26px', minHeight: 48, boxSizing: 'border-box', border: 'none', cursor: 'pointer', fontSize: 15 }}
              >
                Get deal alerts
              </button>
              <button
                type="button"
                id="dd-retailers-space-btn"
                onClick={openVendorModal}
                style={{ textDecoration: 'none', border: '3px solid #111', background: 'transparent', color: '#111', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', padding: '12px 22px', minHeight: 48, boxSizing: 'border-box', cursor: 'pointer', fontSize: 15 }}
              >
                Retailers: book a space
              </button>
            </div>
          </section>

          <section style={{ background: '#111', color: '#FFD400', overflow: 'hidden' }}>
            <div style={{ maxWidth: 1240, margin: '0 auto', padding: '18px 16px', display: 'flex', flexWrap: 'wrap', gap: '10px 20px', justifyContent: 'center', fontFamily: "'Anton', sans-serif", fontSize: 'clamp(18px, 2.8vw, 32px)', textTransform: 'uppercase', letterSpacing: '0.02em', textAlign: 'center' }}>
              <span>50+ Retail Brands</span><span style={{ color: '#D10000' }} aria-hidden="true">●</span>
              <span>Limited-Time Deals</span><span style={{ color: '#D10000' }} aria-hidden="true">●</span>
              <span>One Shopping Destination</span>
            </div>
          </section>

          <section style={{ background: '#fff8cc' }}>
            <div style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(40px, 7vw, 88px) 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 style={{ margin: 0, fontFamily: "'Anton', sans-serif", fontWeight: 400, textTransform: 'uppercase', fontSize: 'clamp(32px, 6vw, 64px)', lineHeight: 1 }}>Shop it all under one roof</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                <div style={{ background: '#111', color: '#fff', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(20px, 4vw, 26px)', textTransform: 'uppercase' }}>Fashion</span><span style={{ color: '#FFD400', fontSize: 13 }}>Festive &amp; everyday</span></div>
                <div style={{ background: '#111', color: '#fff', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(20px, 4vw, 26px)', textTransform: 'uppercase' }}>Footwear</span><span style={{ color: '#FFD400', fontSize: 13 }}>Sneakers to sandals</span></div>
                <div style={{ background: '#111', color: '#fff', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(20px, 4vw, 26px)', textTransform: 'uppercase' }}>Accessories</span><span style={{ color: '#FFD400', fontSize: 13 }}>Bags, watches &amp; more</span></div>
                <div style={{ background: '#111', color: '#fff', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(20px, 4vw, 26px)', textTransform: 'uppercase' }}>Kidswear</span><span style={{ color: '#FFD400', fontSize: 13 }}>For the little shoppers</span></div>
                <div style={{ background: '#111', color: '#fff', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(20px, 4vw, 26px)', textTransform: 'uppercase' }}>Home</span><span style={{ color: '#FFD400', fontSize: 13 }}>Decor, linen &amp; kitchen</span></div>
                <div style={{ background: '#111', color: '#fff', padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}><span style={{ fontFamily: "'Anton', sans-serif", fontSize: 'clamp(20px, 4vw, 26px)', textTransform: 'uppercase' }}>Lifestyle</span><span style={{ color: '#FFD400', fontSize: 13 }}>Clearance &amp; deals</span></div>
              </div>
            </div>
          </section>

          <section style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(40px, 7vw, 88px) 16px', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: '999 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h2 style={{ margin: 0, fontFamily: "'Anton', sans-serif", fontWeight: 400, textTransform: 'uppercase', fontSize: 'clamp(28px, 5vw, 56px)', lineHeight: 1 }}>Retailers — be one of the 50+</h2>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, maxWidth: 620 }}>Brands from Guwahati, Shillong and across the Northeast. Clear stock, launch festive offers and meet thousands of shoppers in six days.</p>
            </div>
            <button
              type="button"
              id="dd-book-space-btn"
              onClick={openVendorModal}
              style={{ textDecoration: 'none', background: '#D10000', color: '#fff', fontWeight: 800, textTransform: 'uppercase', fontSize: 16, padding: '16px 28px', minHeight: 48, boxSizing: 'border-box', boxShadow: '5px 5px 0 #111', border: 'none', cursor: 'pointer' }}
            >
              Book your space
            </button>
          </section>

          <p style={{ margin: 0, maxWidth: 1240, marginInline: 'auto', padding: '0 16px 36px', fontSize: 12, lineHeight: 1.5, color: '#3a3500' }}>
            *Only where participating retailers can substantiate the advertised discount.
          </p>
        </main>
      )}

      {/* ============ BRAHMAPUTRA WINTER CARNIVAL ============ */}
      {activeTab === 'bwc' && (
        <main id="top" className="animate-fade-in" style={{ background: '#2A1612', color: '#F7EBDD', overflowX: 'hidden' }}>
          <section className="bwc-snow" style={{ position: 'relative' }}>
            <svg viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true" style={{ display: 'block', width: '100%', height: 'clamp(40px, 6vw, 70px)' }}>
              <path d="M0 10 Q180 70 360 14 T720 14 T1080 14 T1440 10" fill="none" stroke="#5a3a2c" strokeWidth="2"></path>
              <circle cx="60" cy="30" r="7" fill="#F5C46B" className="glow-bulb"></circle>
              <circle cx="150" cy="44" r="7" fill="#E07A3C"></circle>
              <circle cx="250" cy="38" r="7" fill="#F7EBDD"></circle>
              <circle cx="330" cy="20" r="7" fill="#F5C46B" className="glow-bulb"></circle>
              <circle cx="430" cy="32" r="7" fill="#E07A3C"></circle>
              <circle cx="530" cy="44" r="7" fill="#F5C46B" className="glow-bulb"></circle>
              <circle cx="620" cy="34" r="7" fill="#F7EBDD"></circle>
              <circle cx="700" cy="17" r="7" fill="#E07A3C"></circle>
              <circle cx="790" cy="32" r="7" fill="#F5C46B" className="glow-bulb"></circle>
              <circle cx="890" cy="44" r="7" fill="#F7EBDD"></circle>
              <circle cx="980" cy="34" r="7" fill="#E07A3C"></circle>
              <circle cx="1060" cy="17" r="7" fill="#F5C46B" className="glow-bulb"></circle>
              <circle cx="1150" cy="32" r="7" fill="#E07A3C"></circle>
              <circle cx="1250" cy="43" r="7" fill="#F5C46B" className="glow-bulb"></circle>
              <circle cx="1340" cy="32" r="7" fill="#F7EBDD"></circle>
              <circle cx="1420" cy="14" r="7" fill="#E07A3C"></circle>
            </svg>
            <div style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(36px, 7vw, 96px) 16px clamp(48px, 9vw, 120px)', display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', textAlign: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 'clamp(12px, 2.5vw, 15px)', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#F5C46B' }}>City Mela presents</span>
              <h1 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontWeight: 400, lineHeight: 0.98, fontSize: 'clamp(42px, 9vw, 130px)', color: '#F7EBDD' }}>
                Brahmaputra<br /><em style={{ color: '#F5C46B', fontStyle: 'italic' }}>Winter Carnival</em>
              </h1>
              <p style={{ margin: 0, fontSize: 'clamp(16px, 2.5vw, 24px)', maxWidth: 660, lineHeight: 1.45, color: '#e6d3c0' }}>
                Nine cosy days to close the year — warm food, live music, bonfire glow and the whole city wrapped up in shawls by the river.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 6 }}>
                <div style={{ background: '#F7EBDD', color: '#2A1612', padding: '12px 22px', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 2, boxShadow: '0 0 0 4px #9E2A2B' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9E2A2B' }}>Dates</span>
                  <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(20px, 4vw, 26px)' }}>23–31 Dec 2026</span>
                </div>
                <div style={{ background: '#F7EBDD', color: '#2A1612', padding: '12px 22px', borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 2, boxShadow: '0 0 0 4px #2F5240' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#2F5240' }}>Venue</span>
                  <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(20px, 4vw, 26px)' }}>[VENUE], Guwahati</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 12 }}>
                <button
                  type="button"
                  id="bwc-get-notified-btn"
                  onClick={openAlertModal}
                  style={{ textDecoration: 'none', background: '#E07A3C', color: '#2A1612', fontWeight: 600, padding: '12px 24px', borderRadius: 999, minHeight: 46, boxSizing: 'border-box', border: 'none', cursor: 'pointer', fontSize: 15 }}
                >
                  Get notified
                </button>
                <button
                  type="button"
                  id="bwc-stalls-btn"
                  onClick={openVendorModal}
                  style={{ textDecoration: 'none', border: '2px solid #F5C46B', background: 'transparent', color: '#F5C46B', fontWeight: 600, padding: '10px 22px', borderRadius: 999, minHeight: 46, boxSizing: 'border-box', cursor: 'pointer', fontSize: 15 }}
                >
                  Stalls &amp; sponsorship
                </button>
              </div>
            </div>
          </section>

          <div className="bwc-knit" aria-hidden="true"></div>

          <section style={{ background: '#F7EBDD', color: '#2A1612' }}>
            <div style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(40px, 7vw, 88px) 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              <h2 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: 'clamp(30px, 5vw, 56px)', lineHeight: 1, color: '#9E2A2B' }}>Grab a shawl. Come out.</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div style={{ background: '#fffaf3', border: '2px solid #ead6bf', borderRadius: 24, padding: 'clamp(20px, 4vw, 28px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ width: 48, height: 48, borderRadius: '50%', background: '#9E2A2B', color: '#F7EBDD', fontFamily: "'DM Serif Display', serif", fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>I</span>
                  <h3 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: 'clamp(22px, 4vw, 28px)' }}>Winter food &amp; drink</h3>
                  <p style={{ margin: 0, lineHeight: 1.5, color: '#5a3a2c', fontSize: 15 }}>Smoky grills, traditional winter pitha, gourmet hot chocolate, artisanal tea &amp; coffee, and 35+ curated food stalls facing the river.</p>
                </div>
                <div style={{ background: '#fffaf3', border: '2px solid #ead6bf', borderRadius: 24, padding: 'clamp(20px, 4vw, 28px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ width: 48, height: 48, borderRadius: '50%', background: '#E07A3C', color: '#2A1612', fontFamily: "'DM Serif Display', serif", fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>II</span>
                  <h3 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: 'clamp(22px, 4vw, 28px)' }}>Live music nights</h3>
                  <p style={{ margin: 0, lineHeight: 1.5, color: '#5a3a2c', fontSize: 15 }}>Acoustic riverfront stages, indie singer-songwriters, folk fusion ensembles, and cozy bonfire music sessions under the winter stars.</p>
                </div>
                <div style={{ background: '#fffaf3', border: '2px solid #ead6bf', borderRadius: 24, padding: 'clamp(20px, 4vw, 28px)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <span style={{ width: 48, height: 48, borderRadius: '50%', background: '#2F5240', color: '#F7EBDD', fontFamily: "'DM Serif Display', serif", fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>III</span>
                  <h3 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: 'clamp(22px, 4vw, 28px)' }}>New Year's Eve finale</h3>
                  <p style={{ margin: 0, lineHeight: 1.5, color: '#5a3a2c', fontSize: 15 }}>The carnival closes on 31 December with fireworks over the Brahmaputra, midnight countdown, and an unforgettable celebration.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="bwc-knit" aria-hidden="true"></div>

          <section style={{ background: '#2F5240', color: '#F7EBDD' }}>
            <div style={{ maxWidth: 1240, margin: '0 auto', padding: 'clamp(40px, 7vw, 88px) 16px', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: '999 1 300px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <h2 style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontWeight: 400, fontSize: 'clamp(28px, 5vw, 52px)', lineHeight: 1.05 }}>Be part of Guwahati's year-end</h2>
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, maxWidth: 620, color: '#dfe9e2' }}>Food stalls, retail spaces and sponsorship slots open for brands that want the last nine days of the year.</p>
              </div>
              <button
                type="button"
                id="bwc-enquire-now-btn"
                onClick={openVendorModal}
                style={{ textDecoration: 'none', background: '#F5C46B', color: '#2A1612', fontWeight: 600, fontSize: 16, padding: '14px 26px', borderRadius: 999, minHeight: 48, boxSizing: 'border-box', border: 'none', cursor: 'pointer' }}
              >
                Enquire now
              </button>
            </div>
          </section>
        </main>
      )}

      {/* Global Footer */}
      <footer style={{ background: '#141210', color: '#a39b8f', borderTop: '1px solid #2a2622' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 16px', display: 'flex', flexWrap: 'wrap', gap: '12px 24px', justifyContent: 'space-between', fontSize: 14 }}>
          <span><strong style={{ color: '#fff', letterSpacing: '0.04em' }}>CITY MELA</strong> · The city comes together</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <a href="/terms" style={{ color: '#a39b8f', textDecoration: 'none' }}>Terms &amp; Conditions</a>
            <a href="https://wa.me/919181051445" target="_blank" rel="noopener noreferrer" style={{ color: '#a39b8f' }}>WhatsApp: +91 91810 51445</a>
            <a href="https://www.citymela.shop" target="_blank" rel="noopener noreferrer" style={{ color: '#FFD400' }}>www.citymela.shop</a>
          </div>
        </div>
      </footer>

      {/* Pop Up Form Modal for Little Guwahati Festival */}
      {popupModal !== 'none' && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setPopupModal('none')}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFF7EE',
              color: '#1A0F0C',
              borderRadius: 24,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 2px #7A1F2B',
              width: '100%',
              maxWidth: 560,
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Header */}
            <div
              style={{
                background: '#7A1F2B',
                color: '#FFF7EE',
                padding: '20px 24px',
                borderTopLeftRadius: 22,
                borderTopRightRadius: 22,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#FFC93C',
                    color: '#1A0F0C',
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    padding: '3px 10px',
                    borderRadius: 999,
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  <Sparkles size={12} />
                  LITTLE GUWAHATI FESTIVAL 2026
                </span>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'Bagel Fat One', Arial, sans-serif",
                    fontSize: 'clamp(22px, 4vw, 26px)',
                    color: '#FFC93C',
                    lineHeight: 1.15,
                  }}
                >
                  {popupModal === 'kids' && 'Activity Registration'}
                  {popupModal === 'family' && 'Get Your Family Pass'}
                  {popupModal === 'school' && 'School Championship Registration'}
                  {popupModal === 'stall' && 'Book a Festival Stall'}
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#F5DCC8', lineHeight: 1.4 }}>
                  {popupModal === 'kids' && 'Fill participant & parent details. Mandatory email is required for instant pass delivery.'}
                  {popupModal === 'family' && 'Official digital pass with QR ticket code will be generated and emailed instantly.'}
                  {popupModal === 'school' && 'Confirm your school participation. Digital certificate & entry pass provided.'}
                  {popupModal === 'stall' && 'Reserve your festival stall. Confirmation pass and invoice details sent upon submit.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPopupModal('none')}
                aria-label="Close modal"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  border: 'none',
                  color: '#FFF7EE',
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 24px' }}>
              {/* KIDS MODAL FORM */}
              {popupModal === 'kids' && (
                <form onSubmit={handleKidsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {kidsError && (
                    <div style={{ background: '#FF6B2C', color: '#FFF7EE', padding: '10px 14px', borderRadius: 12, fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={18} />
                      <span>{kidsError}</span>
                    </div>
                  )}
                  {kidsSuccess && (
                    <div style={{ background: '#FFC93C', color: '#1A0F0C', padding: '10px 14px', borderRadius: 12, fontWeight: 800, fontSize: 13 }}>
                      ✓ {kidsSuccess}
                    </div>
                  )}

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                    Activity *
                    <select
                      value={kidsForm.activity}
                      onChange={(e) => setKidsForm({ ...kidsForm, activity: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                    >
                      <option>Kids’ Open Mic (₹199 + GST)</option>
                      <option disabled value="Art Competition (free)">Art Competition (free) — 🔴 Sold Out</option>
                      <option disabled value="Art Workshop">Art Workshop — 🔴 Sold Out</option>
                      <option>AI &amp; Robotics Workshop (₹299 + GST)</option>
                      <option>Try a Music Instrument (free)</option>
                      <option>Crawl Race &amp; Toddler Dash (free)</option>
                    </select>
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                      Participant Name *
                      <input
                        type="text"
                        placeholder="Child's full name"
                        value={kidsForm.name}
                        onChange={(e) => setKidsForm({ ...kidsForm, name: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                        required
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                      Age in years
                      <input
                        type="number"
                        placeholder="e.g. 8"
                        value={kidsForm.age}
                        onChange={(e) => setKidsForm({ ...kidsForm, age: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                      />
                    </label>
                  </div>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                    School (optional)
                    <input
                      type="text"
                      placeholder="School name"
                      value={kidsForm.school}
                      onChange={(e) => setKidsForm({ ...kidsForm, school: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                    />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                    Parent or Guardian Name *
                    <input
                      type="text"
                      placeholder="Parent's full name"
                      value={kidsForm.parent}
                      onChange={(e) => setKidsForm({ ...kidsForm, parent: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                      required
                    />
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                      Email Address * <span style={{ color: '#7A1F2B', fontSize: 11 }}>(Mandatory)</span>
                      <input
                        type="email"
                        placeholder="parent@example.com"
                        value={kidsForm.email}
                        onChange={(e) => setKidsForm({ ...kidsForm, email: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                        required
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                      WhatsApp Number *
                      <input
                        type="tel"
                        placeholder="+91"
                        value={kidsForm.phone}
                        onChange={(e) => setKidsForm({ ...kidsForm, phone: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                        required
                      />
                    </label>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, cursor: 'pointer', marginTop: 4 }}>
                    <input
                      type="checkbox"
                      checked={kidsForm.consent}
                      onChange={(e) => setKidsForm({ ...kidsForm, consent: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: '#7A1F2B', marginTop: 2 }}
                      required
                    />
                    <span>I confirm I am the parent/guardian and consent to the participant taking part in this activity.</span>
                  </label>

                  <button
                    type="submit"
                    disabled={kidsSubmitting}
                    style={{
                      marginTop: 8,
                      background: '#7A1F2B',
                      color: '#FFF7EE',
                      fontSize: 16,
                      fontWeight: 900,
                      padding: '13px 24px',
                      borderRadius: 999,
                      border: 'none',
                      cursor: kidsSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 0 #1A0F0C',
                    }}
                  >
                    {kidsSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Registering &amp; Generating Pass...</span>
                      </>
                    ) : (
                      <span>Complete Registration &amp; Get Pass →</span>
                    )}
                  </button>
                </form>
              )}

              {/* FAMILY MODAL FORM */}
              {popupModal === 'family' && (
                <form onSubmit={handleFamilySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {familyError && (
                    <div style={{ background: '#FF6B2C', color: '#FFF7EE', padding: '10px 14px', borderRadius: 12, fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={18} />
                      <span>{familyError}</span>
                    </div>
                  )}

                  <div style={{ background: '#FFF1E0', border: '1.5px solid #EADDD3', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: '#7A1F2B', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                      Pass Package Selected
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 15, fontWeight: 800 }}>
                      <span>{passLines.length > 0 ? `${passLines.length} item(s) configured` : 'Official Family Pass (All Days)'}</span>
                      <span style={{ color: '#7A1F2B', fontSize: 18 }}>{totalText}</span>
                    </div>
                  </div>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                    Full Name *
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={familyForm.name}
                      onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                      required
                    />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                    Email Address * <span style={{ color: '#7A1F2B', fontSize: 11 }}>(Mandatory — digital QR pass is sent here)</span>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={familyForm.email}
                      onChange={(e) => setFamilyForm({ ...familyForm, email: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                      required
                    />
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                      WhatsApp Number *
                      <input
                        type="tel"
                        placeholder="+91"
                        value={familyForm.phone}
                        onChange={(e) => setFamilyForm({ ...familyForm, phone: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                        required
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                      Child’s School (optional)
                      <input
                        type="text"
                        placeholder="School name"
                        value={familyForm.school}
                        onChange={(e) => setFamilyForm({ ...familyForm, school: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={familySubmitting}
                    style={{
                      marginTop: 8,
                      background: '#7A1F2B',
                      color: '#FFF7EE',
                      fontSize: 16,
                      fontWeight: 900,
                      padding: '13px 24px',
                      borderRadius: 999,
                      border: 'none',
                      cursor: familySubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 0 #1A0F0C',
                    }}
                  >
                    {familySubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Confirming &amp; Generating Pass...</span>
                      </>
                    ) : (
                      <span>{passCtaText} →</span>
                    )}
                  </button>
                </form>
              )}

              {/* SCHOOL MODAL FORM */}
              {popupModal === 'school' && (
                <form onSubmit={handleSchoolSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {schoolError && (
                    <div style={{ background: '#FF6B2C', color: '#FFF7EE', padding: '10px 14px', borderRadius: 12, fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={18} />
                      <span>{schoolError}</span>
                    </div>
                  )}

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                    School Name *
                    <input
                      type="text"
                      placeholder="School name"
                      value={schoolForm.name}
                      onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                      required
                    />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                    Championship Package *
                    <select
                      value={schoolForm.type}
                      onChange={(e) => setSchoolForm({ ...schoolForm, type: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                    >
                      <option>Invited · Free · 3 of 6 championships</option>
                      <option>Participant · ₹20,000 + GST · 3 championships, Pavilion table and own 10×10 stall</option>
                      <option>Champion · ₹40,000 + GST · all 6 championships, own 10×10 stall, creator reel (most popular)</option>
                      <option>Spotlight · ₹60,000 + GST · plus 10-min showcase, prime stall, press meet panel (5 places)</option>
                      <option>Signature · ₹1,00,000 + GST · plus 15-min showcase, 20×20 Experience Zone, main-stage talk (1 place)</option>
                    </select>
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                      Contact Person Name *
                      <input
                        type="text"
                        placeholder="Principal / In-charge name"
                        value={schoolForm.contact}
                        onChange={(e) => setSchoolForm({ ...schoolForm, contact: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                        required
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                      Role / Designation
                      <input
                        type="text"
                        placeholder="Principal, Teacher, Admin..."
                        value={schoolForm.role}
                        onChange={(e) => setSchoolForm({ ...schoolForm, role: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                      />
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                      Email Address * <span style={{ color: '#7A1F2B', fontSize: 11 }}>(Mandatory)</span>
                      <input
                        type="email"
                        placeholder="school@example.com"
                        value={schoolForm.email}
                        onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                        required
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                      Phone / WhatsApp *
                      <input
                        type="tel"
                        placeholder="+91"
                        value={schoolForm.phone}
                        onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                        required
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={schoolSubmitting}
                    style={{
                      marginTop: 8,
                      background: '#7A1F2B',
                      color: '#FFF7EE',
                      fontSize: 16,
                      fontWeight: 900,
                      padding: '13px 24px',
                      borderRadius: 999,
                      border: 'none',
                      cursor: schoolSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 0 #1A0F0C',
                    }}
                  >
                    {schoolSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Registering School &amp; Generating Pass...</span>
                      </>
                    ) : (
                      <span>Register School &amp; Get Pass →</span>
                    )}
                  </button>
                </form>
              )}

              {/* STALL MODAL FORM */}
              {popupModal === 'stall' && (
                <form onSubmit={handleStallSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {stallError && (
                    <div style={{ background: '#FF6B2C', color: '#FFF7EE', padding: '10px 14px', borderRadius: 12, fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={18} />
                      <span>{stallError}</span>
                    </div>
                  )}

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                    Business / Brand Name *
                    <input
                      type="text"
                      placeholder="Your brand or shop name"
                      value={stallForm.biz}
                      onChange={(e) => setStallForm({ ...stallForm, biz: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                      required
                    />
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                    Stall Type *
                    <select
                      value={stallForm.type}
                      onChange={(e) => setStallForm({ ...stallForm, type: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                    >
                      <option>Food stall · 10×10 ft · ₹12,000 + GST</option>
                      <option>Food stall · 5×10 ft · ₹5,000 + GST</option>
                      <option>Shopping stall · 5×10 ft shared · ₹7,000 + GST</option>
                      <option>Shopping stall · 10×10 ft · ₹15,000 + GST</option>
                      <option>Shopping stall · 20×10 ft · ₹30,000 + GST</option>
                    </select>
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                    Contact Person Name *
                    <input
                      type="text"
                      placeholder="Full name"
                      value={stallForm.name}
                      onChange={(e) => setStallForm({ ...stallForm, name: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                      required
                    />
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                      Email Address * <span style={{ color: '#7A1F2B', fontSize: 11 }}>(Mandatory)</span>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={stallForm.email}
                        onChange={(e) => setStallForm({ ...stallForm, email: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                        required
                      />
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                      Phone / WhatsApp *
                      <input
                        type="tel"
                        placeholder="+91"
                        value={stallForm.phone}
                        onChange={(e) => setStallForm({ ...stallForm, phone: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                        required
                      />
                    </label>
                  </div>

                  <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontWeight: 800, fontSize: 13 }}>
                    What will you sell?
                    <input
                      type="text"
                      placeholder="e.g. Handmade cookies, artisanal coffees, wooden toys..."
                      value={stallForm.sell}
                      onChange={(e) => setStallForm({ ...stallForm, sell: e.target.value })}
                      style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: 15, padding: '10px 12px', border: '2px solid #1A0F0C', borderRadius: 10, background: '#FFFFFF', color: '#1A0F0C' }}
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={stallSubmitting}
                    style={{
                      marginTop: 8,
                      background: '#7A1F2B',
                      color: '#FFF7EE',
                      fontSize: 16,
                      fontWeight: 900,
                      padding: '13px 24px',
                      borderRadius: 999,
                      border: 'none',
                      cursor: stallSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 4px 0 #1A0F0C',
                    }}
                  >
                    {stallSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Sending Booking &amp; Generating Pass...</span>
                      </>
                    ) : (
                      <span>Submit Stall Booking &amp; Get Pass →</span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal */}
      <FestivalModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        festivalId={activeTab}
      />
    </div>
  )
}
