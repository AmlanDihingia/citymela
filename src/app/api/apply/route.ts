import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { saveLocalApplication } from '@/lib/storage'
import { sendApplicationEmails } from '@/lib/email'
import { sendWhatsAppPass } from '@/lib/whatsapp'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Minimum required fields
    const brandName = (body.brand_name || body.brand || '').trim()
    const contactName = (body.contact_name || body.contact || '').trim()
    let rawEmail = (body.email || '').trim().toLowerCase()
    const rawPhone = (body.whatsapp_number || body.phone || '').toString()
    const phoneDigits = rawPhone.replace(/\D/g, '').slice(-10)

    // Fallback: extract email from additional_notes if present (e.g., "Email: test@example.com")
    if (!rawEmail && body.additional_notes) {
      const match = String(body.additional_notes).match(/Email:\s*([^\s,;]+)/i)
      if (match && match[1]) {
        rawEmail = match[1].trim().toLowerCase()
      }
    }

    if (!brandName) {
      return NextResponse.json(
        { error: 'Missing required field: brand_name' },
        { status: 400 }
      )
    }

    if (!contactName) {
      return NextResponse.json(
        { error: 'Missing required field: contact_name' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!rawEmail) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }
    if (!emailRegex.test(rawEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    if (phoneDigits.length < 10) {
      return NextResponse.json(
        { error: 'Valid 10-digit whatsapp_number is required' },
        { status: 400 }
      )
    }

    const kitchenType = (body.kitchen_type || body.type || 'Vendor / Retail').trim()
    const category = (body.category || 'General Space Enquiry').trim()
    const source = (body.source || 'direct').trim()

    // Generate unique event pass / ticket ID
    let prefix = 'CM-STALL'
    if (kitchenType === 'Family Pass' || category.includes('Family Pass') || source.includes('family-pass')) {
      prefix = 'LGF-PASS'
    } else if (kitchenType === 'Activity Registration' || source.includes('activity')) {
      prefix = 'LGF-ACT'
    } else if (kitchenType === 'School Championship' || source.includes('school')) {
      prefix = 'LGF-SCH'
    }
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()
    const ticketId = body.ticket_id || `${prefix}-${randomSuffix}`

    const payload = {
      brand_name: brandName,
      contact_name: contactName,
      email: rawEmail,
      ticket_id: ticketId,
      checked_in: false,
      whatsapp_number: phoneDigits,
      instagram_handle: (body.instagram_handle || body.instagram || '').trim() || null,
      kitchen_type: kitchenType,
      category: category,
      hero_dishes: (body.hero_dishes || body.dishes || 'Space & Stall Enquiry').trim(),
      stall_tier: (body.stall_tier || body.tier || 'Standard').trim(),
      daily_capacity: (body.daily_capacity || body.capacity || 'Standard').trim(),
      fssai_status: (body.fssai_status || body.fssai || 'N/A').trim(),
      location_area: (body.location_area || body.area || '').trim() || null,
      additional_notes: (body.additional_notes || body.notes || '').trim() || null,
      source: source,
      status: 'pending' as const,
    }

    // 1. Always save locally first (ensures zero data loss)
    const savedLocal = await saveLocalApplication(payload)

    // 2. Attempt Supabase insert if URL is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    let supabaseSaved = false

    if (supabaseUrl && !supabaseUrl.includes('placeholder.supabase.co')) {
      try {
        const supabase = createClient()
        let { error } = await supabase
          .from('applications')
          .insert([payload])

        // If newer columns do not exist yet in Supabase table, retry with base payload
        if (
          error &&
          (error.message?.includes('email') ||
            error.message?.includes('ticket_id') ||
            error.message?.includes('checked_in'))
        ) {
          console.warn('Supabase missing newer columns (email/ticket_id/checked_in). Inserting base payload...')
          const { email: _, ticket_id: _t, checked_in: _c, ...basePayload } = payload
          const retryRes = await supabase.from('applications').insert([basePayload])
          error = retryRes.error
        }

        if (!error) {
          supabaseSaved = true
        } else {
          console.warn('Supabase DB Insert Warning:', error.message)
        }
      } catch (sbErr: any) {
        console.warn('Supabase Connection Notice:', sbErr?.message || sbErr)
      }
    }

    // 3. Send email notifications to both Customer and Admin via Resend
    const emailResult = await sendApplicationEmails(payload)

    // Log email result explicitly for server logs (visible in Hostinger Node.js logs)
    if (!emailResult.adminSent) {
      console.error(`[EMAIL FAIL] Admin email NOT sent for ${ticketId}. Error: ${emailResult.adminError}`)
    } else {
      console.log(`[EMAIL OK] Admin email sent for ${ticketId}`)
    }
    if (payload.email && !emailResult.customerSent) {
      console.error(`[EMAIL FAIL] Customer email NOT sent for ${ticketId} to ${payload.email}. Error: ${emailResult.customerError}`)
    } else if (payload.email) {
      console.log(`[EMAIL OK] Customer email sent for ${ticketId} to ${payload.email}`)
    }

    // 4. Send automated WhatsApp message
    const whatsappResult = await sendWhatsAppPass(payload)

    // 5. Optional Google Apps Script / Webhook endpoint fallback
    const sheetEndpoint = process.env.NEXT_PUBLIC_SHEET_ENDPOINT
    if (sheetEndpoint && sheetEndpoint.startsWith('https://')) {
      try {
        await fetch(sheetEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch (sheetErr) {
        console.warn('Sheet Endpoint Notice:', sheetErr)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted and saved successfully',
      ticket_id: ticketId,
      stored: {
        local: true,
        supabase: supabaseSaved,
      },
      emails: emailResult,
      whatsapp: whatsappResult,
      data: savedLocal,
    })
  } catch (err: any) {
    console.error('API /api/apply Error:', err)
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
