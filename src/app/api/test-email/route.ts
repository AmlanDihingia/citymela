import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET(request: Request) {
  // Simple security check — only allow if secret matches
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  if (secret !== process.env.DEBUG_SECRET && secret !== 'citymela-debug-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.EMAIL_FROM || 'City Mela <passes@citymela.space>'
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'mailcitymela@gmail.com'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://citymela.space'

  const config = {
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET',
    fromEmail,
    adminEmail,
    appUrl,
    nodeEnv: process.env.NODE_ENV,
  }

  if (!apiKey) {
    return NextResponse.json({
      status: 'error',
      message: 'RESEND_API_KEY is not set on this server',
      config,
    })
  }

  const resend = new Resend(apiKey)

  // Send a test email to admin
  try {
    const testResult = await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `✅ City Mela Email Config Test — ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#FFFBF4;border-radius:12px;border:1px solid #EADDD3;">
          <h2 style="color:#B3122A;margin:0 0 16px;">📧 City Mela Email Test</h2>
          <p style="color:#2A1320;">This is a diagnostic test email sent from <strong>${appUrl}</strong>.</p>
          <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:12px;">
            <tr><td style="padding:6px 0;color:#6B5560;font-weight:600;">FROM</td><td style="padding:6px 0;color:#2A1320;">${fromEmail}</td></tr>
            <tr><td style="padding:6px 0;color:#6B5560;font-weight:600;">TO (Admin)</td><td style="padding:6px 0;color:#2A1320;">${adminEmail}</td></tr>
            <tr><td style="padding:6px 0;color:#6B5560;font-weight:600;">App URL</td><td style="padding:6px 0;color:#2A1320;">${appUrl}</td></tr>
            <tr><td style="padding:6px 0;color:#6B5560;font-weight:600;">Node Env</td><td style="padding:6px 0;color:#2A1320;">${process.env.NODE_ENV}</td></tr>
            <tr><td style="padding:6px 0;color:#6B5560;font-weight:600;">Time</td><td style="padding:6px 0;color:#2A1320;">${new Date().toISOString()}</td></tr>
          </table>
          <p style="margin-top:16px;font-size:12px;color:#8C7882;">If you received this, Resend email is working correctly on this server instance.</p>
        </div>
      `,
    })

    if (testResult.error) {
      return NextResponse.json({
        status: 'error',
        message: 'Resend returned an error',
        resendError: testResult.error,
        config,
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'ok',
      message: `Test email sent to ${adminEmail}. Check your inbox!`,
      resendId: testResult.data?.id,
      config,
    })
  } catch (err: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Exception thrown when calling Resend',
      error: err?.message || String(err),
      config,
    }, { status: 500 })
  }
}
