import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getLocalApplications } from '@/lib/storage'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = (searchParams.get('id') || '').trim()

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }

    // 1. Check local storage
    const localApps = await getLocalApplications()
    const foundLocal = localApps.find(
      a =>
        a.ticket_id?.toLowerCase() === id.toLowerCase() ||
        a.id?.toLowerCase() === id.toLowerCase()
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
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .or(`ticket_id.ilike.${id},id.ilike.${id}`)
          .maybeSingle()

        if (!error && data) {
          return NextResponse.json({
            found: true,
            source: 'supabase',
            ticket: data,
          })
        }
      } catch (sbErr) {
        console.warn('Supabase verify notice:', sbErr)
      }
    }

    return NextResponse.json(
      { found: false, error: 'Pass ID not found in registrations' },
      { status: 404 }
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Verification error' },
      { status: 500 }
    )
  }
}

