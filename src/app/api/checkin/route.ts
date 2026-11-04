import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { getLocalApplications, saveLocalApplication } from '@/lib/storage'
import fs from 'fs/promises'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'applications.json')

export async function POST(request: Request) {
  try {
    const { ticketId } = await request.json()

    if (!ticketId) {
      return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 })
    }

    const checkinTime = new Date().toISOString()
    let updatedLocal = false
    let updatedSupabase = false

    // 1. Update in local storage
    try {
      const apps = await getLocalApplications()
      const index = apps.findIndex(
        a => a.ticket_id === ticketId || a.id === ticketId
      )

      if (index !== -1) {
        apps[index].checked_in = true
        apps[index].additional_notes = `${apps[index].additional_notes || ''} [Checked In at ${checkinTime}]`.trim()
        await fs.writeFile(DATA_FILE, JSON.stringify(apps, null, 2), 'utf-8')
        updatedLocal = true
      }
    } catch (e) {
      console.error('Error updating local check-in:', e)
    }

    // 2. Update in Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl && !supabaseUrl.includes('placeholder.supabase.co')) {
      try {
        const supabase = createClient()
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticketId)

        // 2A. Update by ticket_id directly
        const updateByTicket = await supabase
          .from('applications')
          .update({
            checked_in: true,
            status: 'approved',
          })
          .ilike('ticket_id', ticketId)
          .select('id, ticket_id')

        if (!updateByTicket.error && Array.isArray(updateByTicket.data) && updateByTicket.data.length > 0) {
          updatedSupabase = true
        }

        // 2B. If not updated and is UUID, update by id column
        if (!updatedSupabase && isUuid) {
          const updateById = await supabase
            .from('applications')
            .update({
              checked_in: true,
              status: 'approved',
            })
            .eq('id', ticketId)
            .select('id, ticket_id')

          if (!updateById.error && Array.isArray(updateById.data) && updateById.data.length > 0) {
            updatedSupabase = true
          }
        }

        // 2C. Fallback: Find the row by scanning recent applications and update by row id
        if (!updatedSupabase) {
          const { data: recentRows } = await supabase
            .from('applications')
            .select('id, ticket_id, whatsapp_number')
            .limit(500)

          const target = recentRows?.find(
            (r: any) =>
              (r.ticket_id && r.ticket_id.trim().toLowerCase() === ticketId.trim().toLowerCase()) ||
              (r.id && String(r.id).trim().toLowerCase() === ticketId.trim().toLowerCase())
          )

          if (target?.id) {
            const fallbackUpdate = await supabase
              .from('applications')
              .update({
                checked_in: true,
                status: 'approved',
              })
              .eq('id', target.id)

            if (!fallbackUpdate.error) {
              updatedSupabase = true
            }
          }
        }
      } catch (sbErr) {
        console.warn('Supabase checkin error:', sbErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Attendee checked in successfully',
      ticketId,
      checkinTime,
      updated: {
        local: updatedLocal,
        supabase: updatedSupabase,
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Check-in failed' },
      { status: 500 }
    )
  }
}

