'use client'

import React, { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'

const WA_NUMBER = '919181051445'

interface SavedPass {
  kind: string
  id: string
  line1: string
  line2: string
  msg: string
  qrUrl?: string
}

export default function ChristmasTownSection() {
  // Countdown state
  const [countdownNum, setCountdownNum] = useState('-')
  const [countdownLbl, setCountdownLbl] = useState('days until the first snow')

  // Tab state: "pass" | "contest"
  const [activeFormTab, setActiveFormTab] = useState<'pass' | 'contest'>('pass')
  const [isDone, setIsDone] = useState(false)
  const [ticketData, setTicketData] = useState<SavedPass | null>(null)

  // Pass Form state
  const [pName, setPName] = useState('')
  const [pPhone, setPPhone] = useState('')
  const [pArea, setPArea] = useState('')
  const [pAdults, setPAdults] = useState('2')
  const [pKids, setPKids] = useState('1')
  const [pDay, setPDay] = useState('Not sure yet')
  const [pOptin, setPOptin] = useState(true)
  const [pErr, setPErr] = useState('')

  // Contest Form state
  const [cContest, setCContest] = useState('Art Contest')
  const [cWho, setCWho] = useState('')
  const [cAge, setCAge] = useState('')
  const [cName, setCName] = useState('')
  const [cPhone, setCPhone] = useState('')
  const [cOptin, setCOptin] = useState(true)
  const [cErr, setCErr] = useState('')

  // Stall Booking state
  const [stallSize, setStallSize] = useState('10×10 stall · ₹25,000')
  const [sBiz, setSBiz] = useState('')
  const [sWhat, setSWhat] = useState('')
  const [sName, setSName] = useState('')
  const [sPhone, setSPhone] = useState('')
  const [sLgf, setSLgf] = useState(false)
  const [sErr, setSErr] = useState('')

  // Toast state
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  // Canvas ref for snowfall animation
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // Helper validation
  const phoneOk = (p: string) => /^(\+?91)?[6-9]\d{9}$/.test(p.replace(/[\s-]/g, ''))
  const generateCode = () =>
    'CT-' +
    Array.from({ length: 5 }, () =>
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2200)
  }

  const handleCopy = (val: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(val)
        .then(() => showToast('Copied ' + val))
        .catch(() => showToast('Number: ' + val))
    } else {
      showToast('Number: ' + val)
    }
  }

  // Countdown timer effect
  useEffect(() => {
    function tick() {
      const start = new Date('2026-12-23T00:00:00+05:30')
      const end = new Date('2026-12-28T00:00:00+05:30')
      const now = new Date()
      if (now < start) {
        const d = Math.ceil((start.getTime() - now.getTime()) / 864e5)
        setCountdownNum(String(d))
        setCountdownLbl(d === 1 ? 'day until the first snow' : 'days until the first snow')
      } else if (now < end) {
        setCountdownNum('Now')
        setCountdownLbl('open on the riverfront, snow every evening')
      } else {
        setCountdownNum('See you')
        setCountdownLbl('next Christmas')
      }
    }
    tick()
    const timer = setInterval(tick, 60000)
    return () => clearInterval(timer)
  }, [])

  // Snowfall animation effect
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let animationFrameId: number
    let flakes: Array<{ x: number; y: number; r: number; s: number; d: number }> = []
    let W = 0
    let H = 0

    function size() {
      if (!cv || !ctx) return
      const r = cv.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = r.width
      H = r.height
      cv.width = W * dpr
      cv.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.round(Math.min(160, (W * H) / 9000))
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2.6 + 0.8,
        s: Math.random() * 0.6 + 0.3,
        d: Math.random() * Math.PI * 2,
      }))
      draw()
    }

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = 'rgba(251, 245, 236, 0.85)'
      for (const f of flakes) {
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function step() {
      for (const f of flakes) {
        f.y += f.s * 1.2
        f.d += 0.01
        f.x += Math.sin(f.d) * 0.35
        if (f.y > H + 4) {
          f.y = -4
          f.x = Math.random() * W
        }
      }
      draw()
      animationFrameId = requestAnimationFrame(step)
    }

    size()
    window.addEventListener('resize', size)
    if (!reduce) {
      animationFrameId = requestAnimationFrame(step)
    }

    return () => {
      window.removeEventListener('resize', size)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  // Contest config
  const isChoir = cContest === 'Choir Fest'
  const isAdult = cContest === 'Adults’ Open Mic'
  const whoLabel = isChoir ? 'Choir, church or school name' : isAdult ? 'Performer’s name' : 'Child’s name'
  const whoPlaceholder = isChoir ? 'e.g. St. Mary’s School Choir' : 'Who is taking part?'
  const showAgeField = !isChoir && !isAdult
  const feeText = cContest.includes('Open Mic')
    ? 'Entry ₹199. We confirm your slot and payment on WhatsApp.'
    : cContest === 'Art Contest'
    ? 'Entry ₹99. We confirm your slot and payment on WhatsApp.'
    : isChoir
    ? 'Free. We’ll send heat dates and rules on WhatsApp.'
    : 'Free with your family pass.'

  // Handle Pass submission
  const handlePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pName.trim()) {
      setPErr('Add your name so we know whose pass this is.')
      return
    }
    if (!phoneOk(pPhone.trim())) {
      setPErr('Enter a 10-digit Indian mobile number, the one you use on WhatsApp.')
      return
    }
    setPErr('')

    const id = generateCode()
    const fam = `${pAdults} adults, ${pKids} kids`
    const l1 = `${pName.trim()} · ${fam}`
    const l2 = pDay === 'Not sure yet' ? 'Valid 23–27 December' : pDay
    const msg = `Christmas Town – Free Family Pass\nPass: ${id}\nName: ${pName.trim()}\nPhone: ${pPhone.trim()}\nArea: ${pArea.trim() || '-'}\nFamily: ${fam}\nDay: ${pDay}\nUpdates & partner offers: ${pOptin ? 'Yes' : 'No'}`

    let qrUrl = ''
    try {
      qrUrl = await QRCode.toDataURL(`CHRISTMAS TOWN ${id} | ${l1}`, {
        width: 116,
        margin: 0,
        color: { dark: '#24140F', light: '#ffffff' },
      })
    } catch {
      // fallback
    }

    const saved: SavedPass = {
      kind: 'Free family pass',
      id,
      line1: l1,
      line2: l2,
      msg,
      qrUrl,
    }
    setTicketData(saved)
    setIsDone(true)

    try {
      localStorage.setItem('ct-last', JSON.stringify(saved))
    } catch {
      // ignore
    }

    const doneElem = document.getElementById('pane-done')
    if (doneElem) {
      doneElem.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Handle Contest submission
  const handleContestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cWho.trim()) {
      setCErr('Tell us who is taking part.')
      return
    }
    if (!cName.trim()) {
      setCErr('Add your name as the contact person.')
      return
    }
    if (!phoneOk(cPhone.trim())) {
      setCErr('Enter a 10-digit Indian mobile number, the one you use on WhatsApp.')
      return
    }
    setCErr('')

    const id = generateCode()
    const agePart = showAgeField && cAge.trim() ? ` (age ${cAge.trim()})` : ''
    const l1 = `${cWho.trim()}${agePart}`
    const l2 = cContest.includes('Open Mic')
      ? 'Entry ₹199 · slot confirmed on WhatsApp'
      : cContest === 'Art Contest'
      ? 'Entry ₹99 · slot confirmed on WhatsApp'
      : 'Free with your family pass'
    const msg = `Christmas Town – Contest entry\nRef: ${id}\nContest: ${cContest}\nParticipant: ${cWho.trim()}${agePart}\nContact: ${cName.trim()}\nPhone: ${cPhone.trim()}\nUpdates & partner offers: ${cOptin ? 'Yes' : 'No'}`

    let qrUrl = ''
    try {
      qrUrl = await QRCode.toDataURL(`CHRISTMAS TOWN ${id} | ${l1}`, {
        width: 116,
        margin: 0,
        color: { dark: '#24140F', light: '#ffffff' },
      })
    } catch {
      // fallback
    }

    const saved: SavedPass = {
      kind: cContest,
      id,
      line1: l1,
      line2: l2,
      msg,
      qrUrl,
    }
    setTicketData(saved)
    setIsDone(true)

    try {
      localStorage.setItem('ct-last', JSON.stringify(saved))
    } catch {
      // ignore
    }

    const doneElem = document.getElementById('pane-done')
    if (doneElem) {
      doneElem.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Select contest from contest card button
  const handleSelectContest = (contestName: string) => {
    setCContest(contestName)
    setActiveFormTab('contest')
    setIsDone(false)
    const regSection = document.getElementById('register')
    if (regSection) {
      regSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Handle Stall Booking WhatsApp click
  const handleStallBooking = (e: React.MouseEvent) => {
    let err = ''
    if (!sBiz.trim()) err = 'Add your business name.'
    else if (!sWhat.trim()) err = 'Tell us what you will sell.'
    else if (!sName.trim()) err = 'Add your name.'
    else if (!phoneOk(sPhone.trim())) err = 'Enter a 10-digit Indian mobile number, the one you use on WhatsApp.'

    setSErr(err)
    if (err) {
      e.preventDefault()
      return
    }

    const text = `Christmas Town – Stall booking request\nStall: ${stallSize}\nBusiness: ${sBiz.trim()}\nSelling: ${sWhat.trim()}\nName: ${sName.trim()}\nPhone: ${sPhone.trim()}\nLGF stall owner: ${sLgf ? 'Yes' : 'No'}`
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <div className="christmas-town-section animate-fade-in" style={{ overflowX: 'hidden' }}>
      {/* Christmas Town Header */}
      <header className="top">
        <div className="wrap">
          <a href="#top" aria-label="Christmas Town home">
            <img
              src="/images/christmas-town/logo.png"
              alt="City Mela presents Christmas Town, by the Brahmaputra"
              width={177}
              height={60}
              style={{ height: 60, width: 'auto' }}
            />
          </a>
          <nav className="links" aria-label="Sections">
            <a href="#whats-on">What’s on</a>
            <a href="#days">Five days</a>
            <a href="#contests">Contests</a>
            <a href="#beat-santa">Beat Santa</a>
            <a href="#stalls">Book a stall</a>
            <a href="#visit">Visit</a>
            <a
              className="btn btn-gold"
              href="#register"
              onClick={() => {
                setActiveFormTab('pass')
                setIsDone(false)
              }}
            >
              Free family pass
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* HERO SECTION */}
        <div className="hero">
          <canvas ref={canvasRef} id="snow" aria-hidden="true"></canvas>
          <div className="wrap">
            <div>
              <p className="eyebrow">City Mela presents · Christmas Town</p>
              <h1>
                Snow comes to <em>Guwahati.</em>
              </h1>
              <p className="lead">
                Five evenings of Christmas by the Brahmaputra. Snow falls every evening, the Great Tree lights up, Santa is home and the carols don’t stop. Free for every family.
              </p>
              <div className="facts">
                <span className="chip">
                  <b>23–27</b> December 2026
                </span>
                <span className="chip">Sati Radhika Shanti Udyan, Uzan Bazar riverfront</span>
                <span className="chip">
                  <b>Free</b> with a family pass*
                </span>
              </div>
              <div className="cta-row">
                <a
                  className="btn btn-gold"
                  href="#register"
                  onClick={() => {
                    setActiveFormTab('pass')
                    setIsDone(false)
                  }}
                >
                  Get your free family pass
                </a>
                <a className="btn btn-ghost" href="#contests">
                  Enter a contest
                </a>
                <a className="btn btn-ghost" href="#stalls">
                  Book a stall
                </a>
              </div>
              <p className="disc">
                * The park entry ticket is mandatory for every visitor and is bought separately at the park gate.
              </p>
              <p className="count" id="count" aria-live="polite">
                <strong id="countNum">{countdownNum}</strong> <span id="countLbl">{countdownLbl}</span>
              </p>
            </div>
          </div>
          <div className="ground gamusa" aria-hidden="true"></div>
        </div>

        {/* WHAT’S ON SECTION */}
        <section id="whats-on">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">Inside Christmas Town</p>
              <h2>Christmas Town, corner by corner</h2>
              <p className="lead">
                Nine corners to explore, each with its own name. Come for the snow, stay for the plum cake.
              </p>
            </div>
            <div className="zones">
              <article className="zone feature">
                <span className="ico">❄</span>
                <h3>Snow Square</h3>
                <p>
                  Real snowfall over the riverfront every evening at six, with a countdown from the stage. Guwahati has never had a white Christmas. For five evenings, it gets one.
                </p>
              </article>
              <article className="zone">
                <span className="ico">✦</span>
                <h3>The Great Tree</h3>
                <p>A giant tree, lit on opening night. The city’s Christmas photo.</p>
              </article>
              <article className="zone">
                <span className="ico">⌂</span>
                <h3>Santa’s House</h3>
                <p>Meet Santa, take a photo, and every child goes home with a gift.</p>
              </article>
              <article className="zone">
                <span className="ico">✉</span>
                <h3>North Pole Post Office</h3>
                <p>Write a letter to Santa and post it. Replies are read out on closing night.</p>
              </article>
              <article className="zone">
                <span className="ico">◆</span>
                <h3>Christmas Market</h3>
                <p>Wooden-cabin stalls with gifts, cakes, winter wear and décor from local makers.</p>
              </article>
              <article className="zone">
                <span className="ico">●</span>
                <h3>Plum Cake Lane</h3>
                <p>Plum cake, hot chocolate and the food that tastes like December in the Northeast.</p>
              </article>
              <article className="zone">
                <span className="ico">♪</span>
                <h3>Carol Stage</h3>
                <p>Choirs, open mics, contests and Winners’ Night, every evening.</p>
              </article>
              <article className="zone">
                <span className="ico">★</span>
                <h3>Elf Trail</h3>
                <p>Kids collect stamps across five zones. A full passport earns a treat at Santa’s House.</p>
              </article>
              <article className="zone">
                <span className="ico">♥</span>
                <h3>Giving Tree</h3>
                <p>Leave a gift for a child who needs one. We hand them over through an NGO.</p>
              </article>
            </div>
          </div>
        </section>

        {/* FIVE DAYS SECTION */}
        <section id="days" className="pine">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">Wednesday to Sunday</p>
              <h2>Five days, five names</h2>
              <p className="lead">Snow every evening, Santa every day. Each day has its own big moment.</p>
            </div>
            <div className="days">
              <article className="day">
                <p className="date">
                  <strong>23</strong>
                  <span>Wed · Dec</span>
                </p>
                <h3>Lights On</h3>
                <ul>
                  <li>Lighting of the Great Tree</li>
                  <li>The first snow</li>
                  <li>Art Contest, day 1</li>
                </ul>
              </article>
              <article className="day">
                <p className="date">
                  <strong>24</strong>
                  <span>Thu · Dec</span>
                </p>
                <h3>Christmas Eve</h3>
                <ul>
                  <li>Kids’ Open Mic</li>
                  <li>Carols by the river</li>
                  <li>Art Contest, day 2</li>
                </ul>
              </article>
              <article className="day">
                <p className="date">
                  <strong>25</strong>
                  <span>Fri · Dec</span>
                </p>
                <h3>Christmas Day</h3>
                <ul>
                  <li>Little Santas: best-dressed families</li>
                  <li>Adults’ Open Mic</li>
                </ul>
              </article>
              <article className="day">
                <p className="date">
                  <strong>26</strong>
                  <span>Sat · Dec</span>
                </p>
                <h3>Family Saturday</h3>
                <ul>
                  <li>Crawl Race and Toddler Race</li>
                  <li>The big family day</li>
                </ul>
              </article>
              <article className="day big">
                <p className="date">
                  <strong>27</strong>
                  <span>Sun · Dec</span>
                </p>
                <h3>Grand Finale</h3>
                <ul>
                  <li>Choir Fest final</li>
                  <li>Winners’ Night, with the Beat Santa champions</li>
                  <li>The last snow</li>
                </ul>
              </article>
            </div>
            <p className="note">Stage timings are shared with registered families on WhatsApp closer to the day.</p>
          </div>
        </section>

        {/* CONTESTS SECTION */}
        <section id="contests">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">On the Carol Stage</p>
              <h2>Contests for little ones and big ones</h2>
              <p className="lead">Most are free with your family pass. Winners are crowned on stage on Sunday’s Winners’ Night.</p>
            </div>
            <div className="contests">
              <article className="contest">
                <p className="meta">
                  <span className="when">Wed 23 &amp; Thu 24</span>
                  <span className="fee paid">₹99</span>
                </p>
                <h3>Art Contest</h3>
                <p>Paint your Christmas. For kids, with materials on the spot.</p>
                <button type="button" onClick={() => handleSelectContest('Art Contest')}>
                  Register for this
                </button>
              </article>
              <article className="contest">
                <p className="meta">
                  <span className="when">Thu 24</span>
                  <span className="fee paid">₹199</span>
                </p>
                <h3>Kids’ Open Mic</h3>
                <p>Sing, recite, play or tell a story on Christmas Eve.</p>
                <button type="button" onClick={() => handleSelectContest('Kids’ Open Mic')}>
                  Register for this
                </button>
              </article>
              <article className="contest">
                <p className="meta">
                  <span className="when">Fri 25</span>
                  <span className="fee paid">₹199</span>
                </p>
                <h3>Adults’ Open Mic</h3>
                <p>Your song, your poem, your stand-up, on Christmas night.</p>
                <button type="button" onClick={() => handleSelectContest('Adults’ Open Mic')}>
                  Register for this
                </button>
              </article>
              <article className="contest">
                <p className="meta">
                  <span className="when">Fri 25</span>
                  <span className="fee">Free</span>
                </p>
                <h3>Little Santas</h3>
                <p>Best-dressed family. The kids come as Santa, the family dresses to match.</p>
                <button type="button" onClick={() => handleSelectContest('Little Santas')}>
                  Register for this
                </button>
              </article>
              <article className="contest">
                <p className="meta">
                  <span className="when">Sat 26</span>
                  <span className="fee">Free</span>
                </p>
                <h3>Crawl Race &amp; Toddler Race</h3>
                <p>The cutest race in Guwahati. One for crawlers, one for toddlers.</p>
                <button type="button" onClick={() => handleSelectContest('Crawl Race')}>
                  Register for this
                </button>
              </article>
              <article className="contest">
                <p className="meta">
                  <span className="when">Final Sun 27</span>
                  <span className="fee">Free</span>
                </p>
                <h3>Choir Fest</h3>
                <p>Church and school choirs compete through the week. The final is on closing night.</p>
                <button type="button" onClick={() => handleSelectContest('Choir Fest')}>
                  Register your choir
                </button>
              </article>
            </div>
          </div>
        </section>

        {/* BEAT SANTA SECTION */}
        <section id="beat-santa" className="pine" style={{ paddingBlock: 64 }}>
          <div className="wrap bs">
            <div className="bs-copy">
              <p className="eyebrow" style={{ color: 'var(--gold)' }}>
                At the OGFC Penalty Box · All 5 days
              </p>
              <h2>Beat Santa</h2>
              <p className="lead" style={{ color: '#DCE7DF', marginTop: 14 }}>
                Santa is in goal, and he doesn’t give anything away for free. Three kicks for ₹20. Score past him and win Open Goal Football Community goodies.
              </p>
              <ul className="bs-list">
                <li>
                  <b>₹20</b> for 3 kicks, for kids and grown-ups
                </li>
                <li>The more you score, the bigger the prize</li>
                <li>Daily leaderboard. The champions are crowned on Winners’ Night, Sun 27</li>
                <li>Love football? Join Open Goal Football Community (OGFC) right at the Penalty Box</li>
              </ul>
            </div>
            <div className="bs-score" aria-hidden="true">
              <p className="bs-big">3</p>
              <p className="bs-sub">kicks</p>
              <p className="bs-big" style={{ color: 'var(--cream)' }}>
                ₹20
              </p>
              <p className="bs-sub">one Santa in goal</p>
            </div>
          </div>
        </section>

        {/* REGISTRATION & FAMILY PASS SECTION */}
        <section id="register">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">Register</p>
              <h2>Free family pass</h2>
              <p className="lead">
                Entry is free, but every family needs a pass. It takes a minute, and it helps us keep Christmas Town comfortable for everyone.
              </p>
            </div>
            <div className="reg">
              <div className="panel">
                {!isDone && (
                  <div className="tabs" role="tablist" aria-label="Choose a form">
                    <button
                      type="button"
                      role="tab"
                      id="tab-pass"
                      aria-selected={activeFormTab === 'pass'}
                      onClick={() => setActiveFormTab('pass')}
                    >
                      Family pass
                    </button>
                    <button
                      type="button"
                      role="tab"
                      id="tab-contest"
                      aria-selected={activeFormTab === 'contest'}
                      onClick={() => setActiveFormTab('contest')}
                    >
                      Contest entry
                    </button>
                  </div>
                )}

                {/* Pane: Pass Form */}
                {!isDone && activeFormTab === 'pass' && (
                  <div id="pane-pass" role="tabpanel" aria-labelledby="tab-pass">
                    <form id="passForm" onSubmit={handlePassSubmit} noValidate>
                      <label htmlFor="p-name">
                        Your name
                        <input
                          id="p-name"
                          name="name"
                          autoComplete="name"
                          placeholder="e.g. Priya Sharma"
                          value={pName}
                          onChange={(e) => setPName(e.target.value)}
                          required
                        />
                      </label>
                      <div className="row">
                        <label htmlFor="p-phone">
                          WhatsApp number
                          <input
                            id="p-phone"
                            name="phone"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="10-digit mobile"
                            value={pPhone}
                            onChange={(e) => setPPhone(e.target.value)}
                            required
                          />
                        </label>
                        <label htmlFor="p-area">
                          Area <small>(optional)</small>
                          <input
                            id="p-area"
                            name="area"
                            placeholder="e.g. Chandmari"
                            value={pArea}
                            onChange={(e) => setPArea(e.target.value)}
                          />
                        </label>
                      </div>
                      <div className="row">
                        <label htmlFor="p-adults">
                          Adults
                          <select
                            id="p-adults"
                            name="adults"
                            value={pAdults}
                            onChange={(e) => setPAdults(e.target.value)}
                          >
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                            <option>6</option>
                          </select>
                        </label>
                        <label htmlFor="p-kids">
                          Kids
                          <select
                            id="p-kids"
                            name="kids"
                            value={pKids}
                            onChange={(e) => setPKids(e.target.value)}
                          >
                            <option>0</option>
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4</option>
                            <option>5</option>
                          </select>
                        </label>
                      </div>
                      <label htmlFor="p-day">
                        Which day are you coming?
                        <select
                          id="p-day"
                          name="day"
                          value={pDay}
                          onChange={(e) => setPDay(e.target.value)}
                        >
                          <option>Not sure yet</option>
                          <option>Wed 23 · Lights On</option>
                          <option>Thu 24 · Christmas Eve</option>
                          <option>Fri 25 · Christmas Day</option>
                          <option>Sat 26 · Family Saturday</option>
                          <option>Sun 27 · Grand Finale</option>
                        </select>
                      </label>
                      <label className="check" htmlFor="p-optin">
                        <input
                          type="checkbox"
                          id="p-optin"
                          name="optin"
                          checked={pOptin}
                          onChange={(e) => setPOptin(e.target.checked)}
                        />
                        Send me Christmas Town updates and offers from our partners on WhatsApp.
                      </label>
                      {pErr && (
                        <p className="err" id="p-err" role="alert">
                          {pErr}
                        </p>
                      )}
                      <button className="btn btn-maroon" type="submit">
                        Get my pass
                      </button>
                    </form>
                  </div>
                )}

                {/* Pane: Contest Form */}
                {!isDone && activeFormTab === 'contest' && (
                  <div id="pane-contest" role="tabpanel" aria-labelledby="tab-contest">
                    <form id="contestForm" onSubmit={handleContestSubmit} noValidate>
                      <label htmlFor="c-contest">
                        Contest
                        <select
                          id="c-contest"
                          name="contest"
                          value={cContest}
                          onChange={(e) => setCContest(e.target.value)}
                        >
                          <option>Art Contest</option>
                          <option>Kids’ Open Mic</option>
                          <option>Adults’ Open Mic</option>
                          <option>Little Santas</option>
                          <option>Crawl Race</option>
                          <option>Toddler Race</option>
                          <option>Choir Fest</option>
                        </select>
                      </label>
                      <div className="row">
                        <label htmlFor="c-who" id="c-who-l">
                          <span id="c-who-t">{whoLabel}</span>
                          <input
                            id="c-who"
                            name="who"
                            placeholder={whoPlaceholder}
                            value={cWho}
                            onChange={(e) => setCWho(e.target.value)}
                            required
                          />
                        </label>
                        {showAgeField && (
                          <label htmlFor="c-age" id="c-age-l">
                            Age
                            <input
                              id="c-age"
                              name="age"
                              inputMode="numeric"
                              placeholder="e.g. 7"
                              value={cAge}
                              onChange={(e) => setCAge(e.target.value)}
                            />
                          </label>
                        )}
                      </div>
                      <div className="row">
                        <label htmlFor="c-name">
                          Your name
                          <input
                            id="c-name"
                            name="name"
                            autoComplete="name"
                            placeholder="Parent or contact person"
                            value={cName}
                            onChange={(e) => setCName(e.target.value)}
                            required
                          />
                        </label>
                        <label htmlFor="c-phone">
                          WhatsApp number
                          <input
                            id="c-phone"
                            name="phone"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="10-digit mobile"
                            value={cPhone}
                            onChange={(e) => setCPhone(e.target.value)}
                            required
                          />
                        </label>
                      </div>
                      <p id="c-fee" className="err" style={{ color: 'var(--muted)' }}>
                        {feeText}
                      </p>
                      <label className="check" htmlFor="c-optin">
                        <input
                          type="checkbox"
                          id="c-optin"
                          name="optin"
                          checked={cOptin}
                          onChange={(e) => setCOptin(e.target.checked)}
                        />
                        Send me Christmas Town updates and offers from our partners on WhatsApp.
                      </label>
                      {cErr && (
                        <p className="err" id="c-err" role="alert">
                          {cErr}
                        </p>
                      )}
                      <button className="btn btn-maroon" type="submit">
                        Register
                      </button>
                    </form>
                  </div>
                )}

                {/* Pane: Ticket Done */}
                {isDone && ticketData && (
                  <div id="pane-done" className="pass">
                    <div className="ticket">
                      <div>
                        <p className="eyebrow" style={{ color: 'var(--gold)' }} id="t-kind">
                          {ticketData.kind}
                        </p>
                        <p className="code" id="t-code">
                          {ticketData.id}
                        </p>
                        <p className="small" id="t-line1">
                          {ticketData.line1}
                        </p>
                        <p className="small" id="t-line2">
                          {ticketData.line2}
                        </p>
                      </div>
                      <div className="qr" id="t-qr" aria-label="QR code for your pass">
                        {ticketData.qrUrl ? (
                          <img src={ticketData.qrUrl} alt="Pass QR Code" width={116} height={116} />
                        ) : (
                          <span>{ticketData.id}</span>
                        )}
                      </div>
                    </div>
                    <p>
                      <b style={{ color: 'var(--ink)' }}>One last step:</b> send your registration to City Mela on WhatsApp. We confirm it there, and you show this QR at the gate.
                    </p>
                    <div className="actions">
                      <a
                        className="btn btn-wa"
                        id="t-wa"
                        href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(ticketData.msg)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Send on WhatsApp
                      </a>
                      <button
                        className="linkbtn"
                        type="button"
                        id="t-again"
                        onClick={() => {
                          setIsDone(false)
                          setActiveFormTab('pass')
                          setPName('')
                          setPPhone('')
                          setPArea('')
                          setPErr('')
                          setCWho('')
                          setCAge('')
                          setCName('')
                          setCPhone('')
                          setCErr('')
                        }}
                      >
                        Register someone else
                      </button>
                    </div>
                    <p style={{ fontSize: 14 }}>
                      Take a screenshot of this pass. WhatsApp:{' '}
                      <span className="num" style={{ fontSize: 15 }}>
                        +91 91810 51445
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div className="side">
                <div className="card">
                  <h3>What the pass gets you</h3>
                  <ul>
                    <li>Free entry for your family, any of the five days</li>
                    <li>Snow every evening, Santa’s House and a gift for every child</li>
                    <li>Free entry to the races, Little Santas and the Elf Trail</li>
                    <li>Stage timings and updates on WhatsApp</li>
                  </ul>
                  <p className="disc-s">
                    The park entry ticket is mandatory for every visitor and is bought separately at the park gate.
                  </p>
                </div>
                <div className="card">
                  <h3>Good to know</h3>
                  <ul>
                    <li>One pass covers your whole family.</li>
                    <li>Art Contest entry is ₹99 and Open Mic entries are ₹199 each. We confirm your slot on WhatsApp.</li>
                    <li>Christmas Town is for everyone, whatever you celebrate.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROOF SECTION */}
        <section id="proof">
          <div className="wrap proof">
            <div>
              <p className="eyebrow" style={{ color: 'var(--maroon)' }}>
                Same riverfront, one month ago
              </p>
              <p className="big-num">8,000+</p>
              <h2 style={{ fontSize: 'clamp(28px, 3.6vw, 40px)', marginTop: 10 }}>
                came to Little Guwahati Festival
              </h2>
              <p className="lead" style={{ marginTop: 14, color: 'var(--muted)' }}>
                City Mela’s Children’s Day festival filled Sati Radhika Shanti Udyan on 14 and 15 November. Christmas Town is the same team, the same riverfront, and now there’s snow.
              </p>
              <p className="media">
                Little Guwahati Festival was covered by{' '}
                <b>DY365, News18, Prag News, Pratidin Time, The Assam Tribune, Dainik Janambhumi, The Guwahati Times and Assam Talks</b>.
              </p>
            </div>
            <div className="photos">
              <figure className="a">
                <img src="/images/christmas-town/lgf-1.jpg" alt="Festival Crowd" width={400} height={300} />
              </figure>
              <figure className="b">
                <img src="/images/christmas-town/lgf-2.jpg" alt="Festival Joy" width={200} height={300} />
              </figure>
              <figure className="c">
                <img src="/images/christmas-town/lgf-3.jpg" alt="Kids at Festival" width={200} height={300} />
              </figure>
              <figure className="d">
                <img src="/images/christmas-town/lgf-4.jpg" alt="Performance" width={200} height={300} />
              </figure>
              <figure className="e">
                <img src="/images/christmas-town/lgf-5.jpg" alt="Riverfront Evening" width={200} height={300} />
              </figure>
            </div>
          </div>
        </section>

        {/* STALLS BOOKING SECTION */}
        <section id="stalls">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">For businesses</p>
              <h2>Book a stall at the Christmas Market</h2>
              <p className="lead">
                Five days in front of Guwahati’s families during the biggest gifting week of the year. Gifts, cakes, winter wear, décor, food. Little Guwahati Festival stall owners get first pick.
              </p>
            </div>
            <div className="stall-grid">
              <div className="sizes" role="radiogroup" aria-label="Stall size">
                <label className="size" htmlFor="s-5">
                  <input
                    type="radio"
                    id="s-5"
                    name="size"
                    value="5×10 stall · ₹15,000"
                    checked={stallSize === '5×10 stall · ₹15,000'}
                    onChange={() => setStallSize('5×10 stall · ₹15,000')}
                  />
                  <span className="dim">
                    5×10<small>feet</small>
                  </span>
                  <span className="price">
                    ₹15,000 <small>for all 5 days</small>
                  </span>
                  <p>Room for a counter and display. Good for gifts, décor, cakes and crafts.</p>
                </label>
                <label className="size" htmlFor="s-10">
                  <input
                    type="radio"
                    id="s-10"
                    name="size"
                    value="10×10 stall · ₹25,000"
                    checked={stallSize === '10×10 stall · ₹25,000'}
                    onChange={() => setStallSize('10×10 stall · ₹25,000')}
                  />
                  <span className="dim">
                    10×10<small>feet</small>
                  </span>
                  <span className="price">
                    ₹25,000 <small>for all 5 days</small>
                  </span>
                  <p>Double the space. Good for food, winter wear and brands that need a bigger front.</p>
                </label>
                <p style={{ gridColumn: '1/-1', fontSize: 14, color: 'var(--muted)' }}>
                  23–27 December 2026. GST as applicable, on the final invoice. Stalls are allotted in the order bookings are confirmed.
                </p>
              </div>
              <div className="stall-form">
                <form id="stallForm" onSubmit={(e) => e.preventDefault()} noValidate>
                  <label htmlFor="s-biz">
                    Business name
                    <input
                      id="s-biz"
                      name="biz"
                      placeholder="e.g. Brahmaputra Bakes"
                      value={sBiz}
                      onChange={(e) => setSBiz(e.target.value)}
                      required
                    />
                  </label>
                  <label htmlFor="s-what">
                    What will you sell?
                    <input
                      id="s-what"
                      name="what"
                      placeholder="e.g. Plum cakes and Christmas cookies"
                      value={sWhat}
                      onChange={(e) => setSWhat(e.target.value)}
                      required
                    />
                  </label>
                  <div className="row">
                    <label htmlFor="s-name">
                      Your name
                      <input
                        id="s-name"
                        name="name"
                        autoComplete="name"
                        value={sName}
                        onChange={(e) => setSName(e.target.value)}
                        required
                      />
                    </label>
                    <label htmlFor="s-phone">
                      WhatsApp number
                      <input
                        id="s-phone"
                        name="phone"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="10-digit mobile"
                        value={sPhone}
                        onChange={(e) => setSPhone(e.target.value)}
                        required
                      />
                    </label>
                  </div>
                  <label className="check" htmlFor="s-lgf">
                    <input
                      type="checkbox"
                      id="s-lgf"
                      name="lgf"
                      checked={sLgf}
                      onChange={(e) => setSLgf(e.target.checked)}
                    />
                    I had a stall at Little Guwahati Festival.
                  </label>
                  {sErr && (
                    <p className="err" id="s-err" role="alert">
                      {sErr}
                    </p>
                  )}
                  <button
                    type="button"
                    className="btn btn-wa"
                    id="s-wa"
                    onClick={handleStallBooking}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    Send booking request on WhatsApp
                  </button>
                  <p style={{ fontSize: 14, color: 'var(--muted)' }}>
                    Our team replies on WhatsApp to confirm your stall and payment. City Mela:{' '}
                    <span className="num" style={{ fontSize: 15 }}>
                      +91 91810 51445
                    </span>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* PLAN YOUR VISIT SECTION */}
        <section id="visit" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">Plan your visit</p>
              <h2>See you by the river</h2>
            </div>
            <div className="two">
              <div className="box">
                <dl>
                  <dt>Where</dt>
                  <dd>Sati Radhika Shanti Udyan, Uzan Bazar riverfront, Guwahati</dd>
                  <dt>When</dt>
                  <dd>Wednesday 23 to Sunday 27 December 2026, every afternoon into the evening</dd>
                  <dt>Snow</dt>
                  <dd>Every evening at six, at Snow Square</dd>
                  <dt>Entry</dt>
                  <dd>
                    Free with a family pass. Show your QR at the gate.
                    <span className="disc-d">
                      The park entry ticket is mandatory for every visitor and is bought separately at the park gate.
                    </span>
                  </dd>
                  <dt>Please</dt>
                  <dd>No smoking or alcohol inside. Keep the riverfront clean; bins are everywhere.</dd>
                </dl>
              </div>
              <div className="faq">
                <details>
                  <summary>Is it really free?</summary>
                  <p>
                    Christmas Town is free with a family pass: Santa’s House, the snow and most contests. Art Contest entry is ₹99, Open Mic entries are ₹199, Beat Santa is ₹20 for 3 kicks, and food and market stalls are paid. The park entry ticket is mandatory for every visitor and is bought separately at the park gate.
                  </p>
                </details>
                <details>
                  <summary>Do I need a pass for every person?</summary>
                  <p>No. One pass covers your family. Tell us how many adults and kids are coming.</p>
                </details>
                <details>
                  <summary>Is it only for Christians?</summary>
                  <p>
                    Christmas Town is a city festival for every family in Guwahati, whatever you celebrate. Choirs and churches are part of it, and we keep it respectful of the season.
                  </p>
                </details>
                <details>
                  <summary>Can I come on more than one day?</summary>
                  <p>Yes. Your pass works on all five days.</p>
                </details>
              </div>
            </div>
          </div>
        </section>

        {/* BE PART OF IT / PARTNER SECTION */}
        <section id="partner" className="pine">
          <div className="wrap">
            <div className="sec-head">
              <p className="eyebrow">Be part of it</p>
              <h2>Bring your brand to Christmas Town</h2>
            </div>
            <div>
              <div className="box dark" style={{ background: 'var(--pine-deep)', boxShadow: 'none', maxWidth: 760 }}>
                <h3 style={{ color: 'var(--gold)' }}>Partner with Christmas Town</h3>
                <p>
                  Name the snow, light the Great Tree, present the Choir Fest or set up your own experience zone. Five evenings in front of Guwahati’s families.
                </p>
                <div className="contact">
                  <span>Anupam Bora</span>
                  <span className="num">+91 90511 16151</span>
                  <button className="copy" type="button" onClick={() => handleCopy('+91 90511 16151')}>
                    Copy
                  </button>
                </div>
                <a
                  className="btn btn-gold"
                  style={{ alignSelf: 'flex-start' }}
                  href="https://wa.me/919051116151?text=Hi%20Anupam%2C%20I%27d%20like%20to%20know%20about%20partnering%20with%20Christmas%20Town."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Message on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <div className="gamusa" aria-hidden="true"></div>
      <footer>
        <div className="wrap">
          <div>
            <p className="sign">Merry Christmas, Guwahati!</p>
            <p style={{ marginTop: 10 }}>
              #ChristmasTownGuwahati · Instagram{' '}
              <a href="https://instagram.com/citymelacelebrations" target="_blank" rel="noopener noreferrer">
                @citymelacelebrations
              </a>
            </p>
          </div>
          <div style={{ textAlign: 'right', minWidth: 0 }}>
            <p>City Mela, a unit of YWE Studios (OPC) Pvt Ltd</p>
            <p>mailcitymela@gmail.com · +91 69016 25919</p>
          </div>
        </div>
      </footer>
      <div className="candy" aria-hidden="true"></div>

      {/* Toast notification */}
      {toastVisible && (
        <div className="toast" id="toast">
          {toastMsg}
        </div>
      )}
    </div>
  )
}

