import { ApplicationPayload } from './supabase'

export type WhatsAppResult = {
  sent: boolean
  provider?: string
  error?: string
  directWaUrl: string
}

export async function sendWhatsAppPass(data: ApplicationPayload): Promise<WhatsAppResult> {
  const phone = data.whatsapp_number.replace(/\D/g, '').slice(-10)
  const fullPhone = `91${phone}`
  const ticketId = data.ticket_id || `PASS-${(data.id || '2026').slice(-6).toUpperCase()}`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://citymela.space'
  const passUrl = `${baseUrl}/pass/${encodeURIComponent(ticketId)}`
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(
    `${baseUrl}/verify?id=${encodeURIComponent(ticketId)}`
  )}`

  // Format the friendly WhatsApp message
  const isFamily =
    data.kitchen_type === 'Family Pass' ||
    data.category?.includes('Family Pass') ||
    data.source === 'lgf-family-pass'

  const messageText = isFamily
    ? `🎟️ *Little Guwahati Festival 2026 — Official Family Pass*\n\n` +
      `Hi *${data.contact_name}*, your registration is confirmed! 🎉\n\n` +
      `🎫 *Ticket ID:* \`${ticketId}\`\n` +
      `📦 *Pass:* ${data.stall_tier}\n` +
      `🎁 *Includes:* ${data.hero_dishes}\n` +
      `📅 *Dates:* 14–15 November 2026 (11 AM – 9 PM)\n` +
      `📍 *Venue:* Brahmaputra Riverfront, Guwahati\n\n` +
      `👉 *View & Download Your QR Pass:*\n${passUrl}\n\n` +
      `Please show this QR code at the entrance gate for quick verification. See you at the festival!`
    : `🎉 *City Mela / Pet Puja 2026 — Confirmation*\n\n` +
      `Hi *${data.contact_name}*, we received your details for *${data.brand_name}*!\n\n` +
      `🎫 *Ref ID:* \`${ticketId}\`\n` +
      `🏷️ *Category:* ${data.category}\n` +
      `📋 *Requested:* ${data.stall_tier}\n\n` +
      `👉 *View Your Digital Pass / Status:*\n${passUrl}\n\n` +
      `Our team will also reach out to assist with your booth allotment.`

  const directWaUrl = `https://wa.me/${fullPhone}?text=${encodeURIComponent(messageText)}`

  const result: WhatsAppResult = {
    sent: false,
    directWaUrl,
  }

  // Provider 1: UltraMsg (Instant QR scan gateway)
  const ultraMsgInstance = process.env.ULTRAMSG_INSTANCE_ID
  const ultraMsgToken = process.env.ULTRAMSG_TOKEN

  if (ultraMsgInstance && ultraMsgToken) {
    try {
      // Send image with caption if possible, or text message
      const endpoint = `https://api.ultramsg.com/${ultraMsgInstance}/messages/image`
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: ultraMsgToken,
          to: fullPhone,
          image: qrImageUrl,
          caption: messageText,
        }),
      })
      const resData = await res.json()
      if (res.ok && (resData.sent === 'true' || resData.id)) {
        result.sent = true
        result.provider = 'UltraMsg'
        return result
      }
    } catch (e: any) {
      console.warn('UltraMsg dispatch failed:', e?.message || e)
    }
  }

  // Provider 2: Generic WhatsApp Webhook (Make / Pabbly / Wati / Custom Endpoint)
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL
  if (webhookUrl && webhookUrl.startsWith('https://')) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: fullPhone,
          name: data.contact_name,
          ticketId,
          passUrl,
          qrImageUrl,
          message: messageText,
          payload: data,
        }),
      })
      if (res.ok) {
        result.sent = true
        result.provider = 'Webhook'
        return result
      }
    } catch (e: any) {
      console.warn('WhatsApp webhook dispatch failed:', e?.message || e)
    }
  }

  return result
}

