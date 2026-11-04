import { Resend } from 'resend'
import { ApplicationPayload } from './supabase'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

// Default sender and admin addresses from environment
const FROM_EMAIL = process.env.EMAIL_FROM || 'City Mela <passes@citymela.space>'
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.ORGANIZER_EMAIL || 'mailcitymela@gmail.com'

function isFamilyPassType(data: ApplicationPayload): boolean {
  return (
    data.kitchen_type === 'Family Pass' ||
    (data.category && data.category.includes('Family Pass')) ||
    data.source === 'lgf-family-pass'
  )
}

function isSchoolType(data: ApplicationPayload): boolean {
  return (
    data.kitchen_type === 'School Championship' ||
    data.source === 'lgf-school-registration'
  )
}

function isActivityType(data: ApplicationPayload): boolean {
  return (
    data.kitchen_type === 'Activity Registration' ||
    data.source === 'lgf-activity-signup'
  )
}

function isVisitorType(data: ApplicationPayload): boolean {
  return (
    data.kitchen_type === 'Visitor / Shopper' ||
    (data.source && data.source.includes('-alert')) ||
    data.stall_tier === 'Visitor Signup'
  )
}

function getTicketDetails(data: ApplicationPayload) {
  const ticketId = data.ticket_id || `PASS-${(data.id || '2026').slice(-6).toUpperCase()}`
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://citymela.space'
  const verifyUrl = `${baseUrl}/verify?id=${encodeURIComponent(ticketId)}`
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(verifyUrl)}`

  return { ticketId, verifyUrl, qrImageUrl }
}

function renderAdminEmailHtml(data: ApplicationPayload) {
  const isFamily = isFamilyPassType(data)
  const isSchool = isSchoolType(data)
  const isActivity = isActivityType(data)
  const isVisitor = isVisitorType(data)
  const { ticketId, verifyUrl, qrImageUrl } = getTicketDetails(data)

  const subjectTitle = isFamily
    ? 'New Family Pass Registration'
    : isSchool
    ? 'New School Registration'
    : isActivity
    ? 'New Activity Registration'
    : isVisitor
    ? 'New Festival Alert Signup'
    : 'New Stall Application'

  const waLink = `https://wa.me/91${data.whatsapp_number}?text=${encodeURIComponent(
    `Hi ${data.contact_name}, contacting you regarding your ${subjectTitle} (${ticketId}) for ${data.brand_name}.`
  )}`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F5F0; margin: 0; padding: 24px; color: #2A1320; }
    .card { background-color: #FFFFFF; border-radius: 12px; border: 1px solid #EADDD3; max-width: 620px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background-color: #B3122A; color: #FFFFFF; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; }
    .header p { margin: 6px 0 0; opacity: 0.9; font-size: 14px; }
    .content { padding: 24px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; background-color: #FFF3D6; color: #9A6700; margin-bottom: 16px; }
    .field-row { display: flex; padding: 10px 0; border-bottom: 1px solid #F1E9E3; font-size: 14px; }
    .field-label { width: 38%; font-weight: 600; color: #6B5560; }
    .field-value { width: 62%; font-weight: 500; color: #2A1320; word-break: break-word; }
    .actions { margin-top: 24px; text-align: center; }
    .btn { display: inline-block; background-color: #1F9D55; color: #FFFFFF !important; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px; font-size: 15px; }
    .footer { text-align: center; padding: 16px 24px; font-size: 12px; color: #8C7882; background-color: #FFFBF4; border-top: 1px solid #EADDD3; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>${subjectTitle}</h1>
      <p>City Mela • Admin Alert</p>
    </div>
    <div class="content">
      <div style="text-align: center;">
        <span class="badge">Ticket ID: ${escapeHtml(ticketId)}</span>
      </div>

      <div class="field-row">
        <div class="field-label">Ticket / Pass ID</div>
        <div class="field-value"><strong>${escapeHtml(ticketId)}</strong></div>
      </div>
      <div class="field-row">
        <div class="field-label">${isFamily || isVisitor ? 'Applicant Name' : 'Brand / Business'}</div>
        <div class="field-value"><strong>${escapeHtml(data.brand_name)}</strong></div>
      </div>
      <div class="field-row">
        <div class="field-label">Contact Person</div>
        <div class="field-value">${escapeHtml(data.contact_name)}</div>
      </div>
      <div class="field-row">
        <div class="field-label">Email Address</div>
        <div class="field-value">${data.email ? `<a href="mailto:${escapeHtml(data.email)}" style="color: #B3122A;">${escapeHtml(data.email)}</a>` : '<em>Not provided</em>'}</div>
      </div>
      <div class="field-row">
        <div class="field-label">WhatsApp Number</div>
        <div class="field-value">+91 ${escapeHtml(data.whatsapp_number)}</div>
      </div>
      ${data.instagram_handle ? `
      <div class="field-row">
        <div class="field-label">Instagram</div>
        <div class="field-value">${escapeHtml(data.instagram_handle)}</div>
      </div>` : ''}
      <div class="field-row">
        <div class="field-label">Type / Tier</div>
        <div class="field-value">${escapeHtml(data.stall_tier || data.kitchen_type)}</div>
      </div>
      <div class="field-row">
        <div class="field-label">Category / Detail</div>
        <div class="field-value">${escapeHtml(data.category)}</div>
      </div>
      <div class="field-row">
        <div class="field-label">${isFamily ? 'Pass Items' : isActivity ? 'Participant Details' : 'Details / Dishes'}</div>
        <div class="field-value">${escapeHtml(data.hero_dishes)}</div>
      </div>
      ${data.location_area ? `
      <div class="field-row">
        <div class="field-label">${isFamily || isActivity ? 'School / Area' : 'Location'}</div>
        <div class="field-value">${escapeHtml(data.location_area)}</div>
      </div>` : ''}
      ${data.additional_notes ? `
      <div class="field-row">
        <div class="field-label">Notes</div>
        <div class="field-value">${escapeHtml(data.additional_notes)}</div>
      </div>` : ''}
      <div class="field-row">
        <div class="field-label">Source</div>
        <div class="field-value">${escapeHtml(data.source || 'direct')}</div>
      </div>

      <!-- Quick QR link for admin -->
      <div style="text-align: center; margin-top: 20px; padding: 12px; background: #FFFBF4; border-radius: 8px;">
        <span style="font-size: 12px; color: #6B5560;">Gate Verification URL: </span>
        <a href="${verifyUrl}" target="_blank" style="font-size: 13px; font-weight: 700; color: #B3122A;">${verifyUrl}</a>
      </div>

      <div class="actions">
        <a href="${waLink}" class="btn" target="_blank">Connect via WhatsApp</a>
      </div>
    </div>
    <div class="footer">
      Received on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
    </div>
  </div>
</body>
</html>
  `
}

function renderCustomerEmailHtml(data: ApplicationPayload) {
  const isFamily = isFamilyPassType(data)
  const isSchool = isSchoolType(data)
  const isActivity = isActivityType(data)
  const isVisitor = isVisitorType(data)
  const { ticketId, verifyUrl, qrImageUrl } = getTicketDetails(data)

  const helplineNumber = '919181051445'
  const waHelpLink = `https://wa.me/${helplineNumber}?text=${encodeURIComponent(
    `Hi City Mela Team, I have a question regarding my pass ${ticketId} for ${data.contact_name}.`
  )}`

  const headerTitle = isFamily
    ? 'Family Pass Registered! 🎟️'
    : isSchool
    ? 'School Registered! 🏫'
    : isActivity
    ? 'Activity Confirmed! 🎨'
    : isVisitor
    ? 'You’re on the VIP List! 🔔'
    : 'Application Received! 🎉'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F5F0; margin: 0; padding: 24px; color: #2A1320; }
    .card { background-color: #FFFFFF; border-radius: 12px; border: 1px solid #EADDD3; max-width: 600px; margin: 0 auto; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #B3122A 0%, #870D1F 100%); color: #FFFFFF; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0 0 8px; font-size: 24px; font-weight: 800; }
    .header p { margin: 0; opacity: 0.92; font-size: 15px; }
    .content { padding: 28px 24px; }
    .greeting { font-size: 16px; line-height: 1.6; color: #2A1320; margin-bottom: 20px; }
    .summary-box { background-color: #FFFBF4; border: 1px solid #EADDD3; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .summary-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #B3122A; margin-bottom: 12px; }
    .summary-item { font-size: 14px; margin-bottom: 6px; color: #4A3540; }
    .summary-item strong { color: #2A1320; }
    .steps-box { background-color: #F0FAF7; border: 1px solid #B8E4D8; border-radius: 8px; padding: 18px; margin: 20px 0; }
    .steps-title { font-size: 14px; font-weight: 700; color: #159A92; margin-bottom: 8px; }
    .steps-list { margin: 0; padding-left: 20px; font-size: 14px; color: #2A1320; line-height: 1.6; }
    .actions { margin: 24px 0 12px; text-align: center; }
    .btn { display: inline-block; background-color: #1F9D55; color: #FFFFFF !important; text-decoration: none; font-weight: 600; padding: 12px 28px; border-radius: 9999px; font-size: 15px; box-shadow: 0 2px 6px rgba(31,157,85,0.3); }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #8C7882; background-color: #FFFBF4; border-top: 1px solid #EADDD3; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>${headerTitle}</h1>
      <p>City Mela • Little Guwahati Festival & Pet Puja 2026</p>
    </div>
    <div class="content">
      <div class="greeting">
        Hi <strong>${escapeHtml(data.contact_name)}</strong>,<br/><br/>
        ${
          isFamily
            ? 'Thank you for registering your Family Pass! Your digital entry pass is ready below.'
            : isSchool
            ? `Thank you for registering <strong>${escapeHtml(data.brand_name)}</strong> for the School Championship!`
            : isActivity
            ? `Thank you for signing up for <strong>${escapeHtml(data.category)}</strong>! Here is your entry pass.`
            : isVisitor
            ? `Thank you for signing up for deal alerts and lineup drops for <strong>${escapeHtml(data.category)}</strong>!`
            : `Thank you for applying to showcase <strong>${escapeHtml(data.brand_name)}</strong> with us. We are thrilled by your interest!`
        }
      </div>

      <!-- Digital QR Entry Pass — Full Self-Contained Card (no external links) -->
      <div style="text-align: center; background: linear-gradient(160deg, #1A0F0C 0%, #2e1a16 100%); border-radius: 16px; padding: 28px 20px; margin: 24px 0; box-shadow: 0 6px 24px rgba(26,15,12,0.25);">
        <!-- OFFICIAL PASS badge -->
        <div style="margin-bottom: 14px;">
          <span style="display: inline-block; font-size: 11px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #111111; background: #FFD400; padding: 5px 16px; border-radius: 999px;">
            🎟️ Official Festival Pass
          </span>
        </div>

        <!-- QR Code -->
        <div style="display: inline-block; background: #FFFFFF; padding: 14px; border-radius: 12px; border: 3px solid #FFD400; margin-bottom: 16px;">
          <img src="${qrImageUrl}" alt="Entry QR Code for ${escapeHtml(ticketId)}" width="200" height="200" style="display: block; border-radius: 4px;" />
        </div>

        <!-- Ticket ID -->
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 22px; font-weight: 900; letter-spacing: 3px; color: #FFD400; margin-bottom: 6px;">
          ${escapeHtml(ticketId)}
        </div>

        <!-- Name & Pass type -->
        <div style="font-size: 20px; font-weight: 800; color: #FFFFFF; margin-bottom: 2px;">
          ${escapeHtml(data.contact_name)}
        </div>
        <div style="font-size: 14px; color: #d8a97d; font-weight: 600; margin-bottom: 20px;">
          ${escapeHtml(data.stall_tier || data.category)}
        </div>

        <!-- Pass detail rows inside the dark card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; text-align: left; background: rgba(255,255,255,0.07); border-radius: 10px; overflow: hidden; margin-bottom: 20px;">
          ${data.hero_dishes ? `<tr>
            <td style="padding: 9px 14px; font-size: 12px; color: #c9b8b2; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.08); width: 42%;">Inclusions</td>
            <td style="padding: 9px 14px; font-size: 12px; color: #fff; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.08);">${escapeHtml(data.hero_dishes)}</td>
          </tr>` : ''}
          ${data.location_area ? `<tr>
            <td style="padding: 9px 14px; font-size: 12px; color: #c9b8b2; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.08);">School / City</td>
            <td style="padding: 9px 14px; font-size: 12px; color: #fff; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.08);">${escapeHtml(data.location_area)}</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 9px 14px; font-size: 12px; color: #c9b8b2; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.08);">WhatsApp</td>
            <td style="padding: 9px 14px; font-size: 12px; color: #fff; font-weight: 600; border-bottom: 1px solid rgba(255,255,255,0.08);">+91 ${escapeHtml(data.whatsapp_number)}</td>
          </tr>
          <tr>
            <td style="padding: 9px 14px; font-size: 12px; color: #c9b8b2; font-weight: 700;">Festival</td>
            <td style="padding: 9px 14px; font-size: 12px; color: #fff; font-weight: 600;">14–15 Nov 2026 • Brahmaputra Riverfront</td>
          </tr>
        </table>

        <!-- Gate instruction -->
        <p style="font-size: 13px; color: #c9b8b2; margin: 0; line-height: 1.6;">
          📲 <strong style="color: #FFD400;">Show this email at the entrance gate</strong> for instant QR scan and check-in.<br/>
          No printout needed — your phone screen is enough!
        </p>
      </div>

      <div class="steps-box">
        <div class="steps-title">How to Enter the Festival:</div>
        <ol class="steps-list">
          <li><strong>Keep this email open</strong> on your phone before reaching the gate.</li>
          <li><strong>Gate staff will scan</strong> the QR code directly from your screen.</li>
          <li><strong>Walk straight in</strong> and enjoy the shows, workshops, stalls &amp; lucky draws!</li>
        </ol>
      </div>

      <div class="actions">
        <a href="${waHelpLink}" class="btn" target="_blank">Chat with our team on WhatsApp</a>
      </div>

      <p style="font-size: 13px; color: #6B5560; text-align: center; margin-top: 20px;">
        Questions? Reply to this email or reach us on WhatsApp anytime.
      </p>
    </div>
    <div class="footer">
      City Mela 2026 • Guwahati's Biggest Community Festival<br/>
      Pass issued to ${escapeHtml(data.email || data.contact_name)} • Ticket ID: ${escapeHtml(ticketId)}
    </div>
  </div>
</body>
</html>
  `
}

function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export type EmailSendResult = {
  adminSent: boolean
  customerSent: boolean
  adminError?: string
  customerError?: string
}

export async function sendApplicationEmails(data: ApplicationPayload): Promise<EmailSendResult> {
  const result: EmailSendResult = {
    adminSent: false,
    customerSent: false,
  }

  if (!resend) {
    console.warn(
      'Resend is not initialized. Please set RESEND_API_KEY in .env.local to enable email notifications.'
    )
    result.adminError = 'RESEND_API_KEY is not configured'
    result.customerError = 'RESEND_API_KEY is not configured'
    return result
  }

  const isFamily = isFamilyPassType(data)
  const isSchool = isSchoolType(data)
  const isActivity = isActivityType(data)
  const isVisitor = isVisitorType(data)
  const { ticketId } = getTicketDetails(data)

  const adminSubject = isFamily
    ? `🎟️ New Family Pass [${ticketId}]: ${data.contact_name} (${data.stall_tier})`
    : isSchool
    ? `🏫 New School Registration [${ticketId}]: ${data.brand_name} (${data.contact_name})`
    : isActivity
    ? `🎨 New Activity Registration [${ticketId}]: ${data.brand_name} (${data.contact_name})`
    : isVisitor
    ? `🔔 New Alert Signup [${ticketId}]: ${data.contact_name} (${data.category})`
    : `🔥 New Stall Application [${ticketId}]: ${data.brand_name} (${data.category})`

  const customerSubject = isFamily
    ? `🎟️ Your Event Pass [${ticketId}] — City Mela 2026`
    : isSchool
    ? `🏫 School Championship Registration Confirmed [${ticketId}] — City Mela 2026`
    : isActivity
    ? `🎨 Activity Pass Confirmed [${ticketId}] — Little Guwahati Festival`
    : isVisitor
    ? `🔔 Welcome to City Mela Festival Updates!`
    : `Application Received [${ticketId}]: Welcome to Pet Puja 2026! 🎉`

  // 1. Send Admin Notification Email
  if (ADMIN_EMAIL) {
    try {
      const adminResponse = await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        replyTo: data.email || undefined,
        subject: adminSubject,
        html: renderAdminEmailHtml(data),
      })

      if (adminResponse.error) {
        console.error('Resend Admin Email Error:', adminResponse.error)
        result.adminError = adminResponse.error.message
      } else {
        result.adminSent = true
      }
    } catch (err: any) {
      console.error('Failed to send admin notification email:', err)
      result.adminError = err?.message || 'Unknown error'
    }
  } else {
    console.warn('ADMIN_NOTIFICATION_EMAIL is not configured in .env.local')
    result.adminError = 'ADMIN_NOTIFICATION_EMAIL is not set'
  }

  // 2. Send Customer Confirmation Email (only if email was provided)
  if (data.email) {
    try {
      const customerResponse = await resend.emails.send({
        from: FROM_EMAIL,
        to: data.email,
        replyTo: ADMIN_EMAIL,
        subject: customerSubject,
        html: renderCustomerEmailHtml(data),
      })

      if (customerResponse.error) {
        console.error('Resend Customer Email Error:', customerResponse.error)
        result.customerError = customerResponse.error.message
      } else {
        result.customerSent = true
      }
    } catch (err: any) {
      console.error('Failed to send customer confirmation email:', err)
      result.customerError = err?.message || 'Unknown error'
    }
  } else {
    result.customerError = 'No customer email provided'
  }

  return result
}
