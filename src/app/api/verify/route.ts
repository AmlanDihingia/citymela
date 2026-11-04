import { NextResponse } from 'next/server'
import { createClient, ApplicationPayload } from '@/lib/supabase'
import { getLocalApplications } from '@/lib/storage'

function extractPassId(raw: string): string {
  let cleaned = (raw || '').trim()
  if (!cleaned) return ''

  // If it's a full URL (e.g. from QR scan: https://citymela.space/verify?id=LGF-PASS-9HBG or /pass/LGF-PASS-9HBG)
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    try {
      const url = new URL(cleaned)
      const idParam = url.searchParams.get('id')
      if (idParam) return idParam.trim()
      const match = url.pathname.match(/\/pass\/([^/?#]+)/i)
      if (match && match[1]) return decodeURIComponent(match[1]).trim()
    } catch {
      // ignore URL parse failure
    }
  }

  // If URL query string format: ?id=... or id=...
  if (cleaned.includes('id=')) {
    const match = cleaned.match(/[?&]?id=([^&#]+)/i)
    if (match && match[1]) return decodeURIComponent(match[1]).trim()
  }

  return cleaned
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawId = searchParams.get('id') || searchParams.get('ticketId') || searchParams.get('ticket_id') || ''
    const id = extractPassId(rawId)

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }

    const cleanPhone = id.replace(/\D/g, '')

    // 1. Check local storage
    const localApps = await getLocalApplications()
    const foundLocal = localApps.find(
      a =>
        (a.ticket_id && a.ticket_id.trim().toLowerCase() === id.toLowerCase()) ||
        (a.id && String(a.id).trim().toLowerCase() === id.toLowerCase()) ||
        (cleanPhone.length >= 10 && a.whatsapp_number && a.whatsapp_number.includes(cleanPhone))
    )

    if (foundLocal) {
      return NextResponse.json({
        found: true,
        source: 'local',
        ticket: foundLocal,
      })
    }

    // 2. Check Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl && !supabaseUrl.includes('placeholder.supabase.co')) {
      try {
        const supabase = createClient()
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
        let foundTicket: ApplicationPayload | null = null

        // 2A. Direct match by ticket_id (case-insensitive)
        try {
          const { data, error } = await supabase
            .from('applications')
            .select('*')
            .ilike('ticket_id', id)
            .limit(1)

          if (!error && Array.isArray(data) && data.length > 0) {
            foundTicket = data[0]
          }
        } catch (err) {
          console.warn('Supabase ticket_id query notice:', err)
        }

        // 2B. If id looks like a valid UUID, match by id column
        if (!foundTicket && isUuid) {
          try {
            const { data, error } = await supabase
              .from('applications')
              .select('*')
              .eq('id', id)
              .limit(1)

            if (!error && Array.isArray(data) && data.length > 0) {
              foundTicket = data[0]
            }
          } catch (err) {
            console.warn('Supabase UUID query notice:', err)
          }
        }

        // 2C. If phone number entered (10 digits)
        if (!foundTicket && cleanPhone.length >= 10) {
          try {
            const { data, error } = await supabase
              .from('applications')
              .select('*')
              .ilike('whatsapp_number', `%${cleanPhone.slice(-10)}%`)
              .limit(1)

            if (!error && Array.isArray(data) && data.length > 0) {
              foundTicket = data[0]
            }
          } catch (err) {
            console.warn('Supabase phone query notice:', err)
          }
        }

        // 2D. Resilient fallback: Fetch recent registrations (exactly like dashboard does)
        // This ensures that even if Supabase indexing or specific filters fail, the record is found!
        if (!foundTicket) {
          try {
            const { data, error } = await supabase
              .from('applications')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(500)

            if (!error && Array.isArray(data)) {
              const matched = data.find((a: ApplicationPayload) => {
                if (a.ticket_id && a.ticket_id.trim().toLowerCase() === id.toLowerCase()) return true
                if (a.id && String(a.id).trim().toLowerCase() === id.toLowerCase()) return true
                if (cleanPhone.length >= 10 && a.whatsapp_number && a.whatsapp_number.includes(cleanPhone.slice(-10))) return true
                if (a.additional_notes && a.additional_notes.toLowerCase().includes(id.toLowerCase())) return true
                return false
              })

              if (matched) {
                foundTicket = matched
              }
            }
          } catch (err) {
            console.warn('Supabase list fallback notice:', err)
          }
        }

        if (foundTicket) {
          return NextResponse.json({
            found: true,
            source: 'supabase',
            ticket: foundTicket,
          })
        }
      } catch (sbErr) {
        console.warn('Supabase verify notice:', sbErr)
      }
    }

    return NextResponse.json(
      { found: false, error: `Pass ID "${id}" not found in registrations.` },
      { status: 404 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Verification error' },
      { status: 500 }
    )
  }
}

