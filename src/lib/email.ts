import { Resend } from 'resend'
import { ApplicationPayload } from './supabase'

// Read API key at module load — it never changes at runtime
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

// Helper to get sender config at call time (not at module load)
// This ensures production env vars are always respected
function getEmailConfig() {
  const FROM_EMAIL = process.env.EMAIL_FROM || 'City Mela <passes@citymela.space>'
  const ADMIN_EMAIL =
    process.env.ADMIN_NOTIFICATION_EMAIL ||
    process.env.ORGANIZER_EMAIL ||
    'mailcitymela@gmail.com'
  return { FROM_EMAIL, ADMIN_EMAIL }
}

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
  const { ticketId, qrImageUrl } = getTicketDetails(data)

  const helplineNumber = '919181051445'
  const waHelpLink = `https://wa.me/${helplineNumber}?text=${encodeURIComponent(
    `Hi City Mela Team, I have a question regarding my pass ${ticketId} for ${data.contact_name}.`
  )}`

  const passBadge = isFamily
    ? 'FAMILY ADMISSION PASS'
    : isSchool
    ? 'SCHOOL CHAMPIONSHIP PASS'
    : isActivity
    ? 'ACTIVITY PARTICIPANT PASS'
    : isVisitor
    ? 'VIP FESTIVAL PASS'
    : 'OFFICIAL STALL PASS'

  const passCategory = data.stall_tier || data.category || 'General Admission'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark light">
  <title>Your Festival Pass — ${escapeHtml(ticketId)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0a09; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #f5f5f4;">
  <!-- Email Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0c0a09; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 580px; background-color: #171412; border: 1px solid #2e2824; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
          
          <!-- Gold Top Glow Bar -->
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #d97706, #FFD400, #f59e0b, #d97706); line-height: 4px; font-size: 0;">&nbsp;</td>
          </tr>

          <!-- Festival Header -->
          <tr>
            <td style="padding: 32px 28px 20px; text-align: center;">
              <div style="display: inline-block; padding: 4px 14px; border-radius: 999px; background-color: rgba(255, 212, 0, 0.12); border: 1px solid rgba(255, 212, 0, 0.35); font-size: 10px; font-weight: 800; letter-spacing: 2.5px; text-transform: uppercase; color: #FFD400; margin-bottom: 12px;">
                LITTLE GUWAHATI FESTIVAL &bull; PET PUJA 2026
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; line-height: 1.2;">
                Your Official Digital Pass
              </h1>
              <p style="margin: 8px 0 0; font-size: 13px; color: #a8a29e; font-weight: 500;">
                Confirmed &bull; Ready for Instant Gate Check-In
              </p>
            </td>
          </tr>

          <!-- Ticket Stub (Luxury VIP Pass Card) -->
          <tr>
            <td style="padding: 0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(180deg, #1f1a17 0%, #171311 100%); border: 1px solid #3d332c; border-radius: 20px; overflow: hidden; box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);">
                
                <!-- Ticket Header Strip -->
                <tr>
                  <td style="padding: 16px 20px; background-color: #241e1a; border-bottom: 1px solid #362c26; text-align: center;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="left" style="font-size: 10px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #FFD400;">
                          ${passBadge}
                        </td>
                        <td align="right" style="font-size: 11px; font-weight: 700; color: #22c55e;">
                          &bull; VERIFIED ENTRY
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- QR Code & Attendee Hero -->
                <tr>
                  <td style="padding: 28px 24px 20px; text-align: center;">
                    <!-- QR Frame -->
                    <div style="display: inline-block; padding: 12px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 3px solid #FFD400;">
                      <img src="${qrImageUrl}" alt="Pass QR Code" width="190" height="190" style="display: block; border-radius: 6px;" />
                    </div>

                    <!-- Pass ID Display -->
                    <div style="margin-top: 18px;">
                      <span style="display: inline-block; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 22px; font-weight: 900; letter-spacing: 3px; color: #FFD400; background: rgba(255, 212, 0, 0.08); padding: 6px 18px; border-radius: 8px; border: 1px dashed rgba(255, 212, 0, 0.4);">
                        ${escapeHtml(ticketId)}
                      </span>
                    </div>

                    <!-- Attendee Name -->
                    <div style="margin-top: 14px; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px;">
                      ${escapeHtml(data.contact_name)}
                    </div>
                    <div style="margin-top: 4px; font-size: 13px; font-weight: 700; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px;">
                      ${escapeHtml(passCategory)}
                    </div>
                  </td>
                </tr>

                <!-- Perforation Line -->
                <tr>
                  <td style="padding: 0 16px;">
                    <div style="border-top: 2px dashed #3a3029; height: 1px; line-height: 1px; font-size: 0;">&nbsp;</div>
                  </td>
                </tr>

                <!-- Pass Details Grid -->
                <tr>
                  <td style="padding: 20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="50%" valign="top" style="padding-bottom: 14px;">
                          <div style="font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #78716c;">DATES</div>
                          <div style="font-size: 13px; font-weight: 700; color: #f5f5f4; margin-top: 3px;">14 &ndash; 15 Nov 2026</div>
                          <div style="font-size: 11px; color: #a8a29e;">11:00 AM &ndash; 9:00 PM</div>
                        </td>
                        <td width="50%" valign="top" style="padding-bottom: 14px;">
                          <div style="font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #78716c;">VENUE</div>
                          <div style="font-size: 13px; font-weight: 700; color: #f5f5f4; margin-top: 3px;">Brahmaputra Riverfront</div>
                          <div style="font-size: 11px; color: #a8a29e;">Guwahati, Assam</div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" valign="top" style="padding-bottom: 14px;">
                          <div style="font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #78716c;">REGISTERED WHATSAPP</div>
                          <div style="font-size: 13px; font-weight: 700; color: #f5f5f4; margin-top: 3px; font-family: monospace;">+91 ${escapeHtml(data.whatsapp_number)}</div>
                        </td>
                        <td width="50%" valign="top" style="padding-bottom: 14px;">
                          <div style="font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #78716c;">${data.location_area ? 'SCHOOL / CITY' : 'ADMIT'}</div>
                          <div style="font-size: 13px; font-weight: 700; color: #f5f5f4; margin-top: 3px;">${escapeHtml(data.location_area || '1 Pass (Full Access)')}</div>
                        </td>
                      </tr>
                      ${data.hero_dishes ? `
                      <tr>
                        <td colspan="2" valign="top" style="padding-top: 4px;">
                          <div style="font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #78716c;">PASS INCLUSIONS</div>
                          <div style="font-size: 12px; font-weight: 600; color: #fef08a; margin-top: 4px; background: rgba(254, 240, 138, 0.08); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(254, 240, 138, 0.2);">
                            ${escapeHtml(data.hero_dishes)}
                          </div>
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>

                <!-- Fast Gate Scan Tip -->
                <tr>
                  <td style="padding: 14px 20px; background-color: rgba(255, 212, 0, 0.05); border-top: 1px solid #362c26; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #d6d3d1; line-height: 1.5;">
                      📲 <strong style="color: #FFD400;">Entrance Gate Tip:</strong> Present this QR code on your phone screen to our gate volunteers for rapid verification. No paper printout required!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Festival Highlights Strip -->
          <tr>
            <td style="padding: 24px 24px 8px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #12100e; border: 1px solid #29231f; border-radius: 14px; padding: 16px;">
                <tr>
                  <td style="font-size: 12px; color: #a8a29e; line-height: 1.6;">
                    <strong style="color: #ffffff; font-size: 13px;">What to Expect at Little Guwahati Festival:</strong><br/>
                    &bull; 🎪 50+ Curated Stalls &bull; 🐾 Pet Puja Blessings &amp; Adoption<br/>
                    &bull; 🎨 Open Mic &amp; Art Contests &bull; 🍔 Guwahati Street Food Trail<br/>
                    &bull; 🎁 Hourly Lucky Draws &amp; Family Games
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- WhatsApp Concierge Button -->
          <tr>
            <td style="padding: 16px 24px 24px; text-align: center;">
              <a href="${waHelpLink}" target="_blank" style="display: inline-block; background-color: #1F9D55; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 800; padding: 12px 28px; border-radius: 999px; box-shadow: 0 4px 14px rgba(31, 157, 85, 0.35);">
                💬 Need Help? Chat with Festival Team on WhatsApp
              </a>
              <p style="margin: 12px 0 0; font-size: 12px; color: #78716c;">
                You can also reply directly to this email with any questions.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 24px; background-color: #110e0d; border-top: 1px solid #241e1b; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #78716c; line-height: 1.5;">
                Little Guwahati Festival & Pet Puja 2026 &bull; Brahmaputra Riverfront, Guwahati<br/>
                Pass issued to <strong style="color: #a8a29e;">${escapeHtml(data.email || data.contact_name)}</strong> &bull; Ticket ID: <strong style="color: #FFD400;">${escapeHtml(ticketId)}</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
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
      'Resend is not initialized. Please set RESEND_API_KEY in environment variables to enable email notifications.'
    )
    result.adminError = 'RESEND_API_KEY is not configured'
    result.customerError = 'RESEND_API_KEY is not configured'
    return result
  }

  // Read config at call time (not module load) for production safety
  const { FROM_EMAIL, ADMIN_EMAIL } = getEmailConfig()

  console.log(`[EMAIL] Sending from: ${FROM_EMAIL} | Admin: ${ADMIN_EMAIL} | Key prefix: ${resendApiKey?.substring(0, 8)}...`)

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
