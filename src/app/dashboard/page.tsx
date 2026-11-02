export const revalidate = 0 // Disable caching so submissions are always live

import React from 'react'
import { createClient } from '@/lib/supabase'
import { getLocalApplications } from '@/lib/storage'
import { ApplicationPayload } from '@/lib/supabase'
import { Download, MessageCircle, Store, Calendar, Tag, RefreshCw } from 'lucide-react'

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (e) {
    return dateString
  }
}

export default async function DashboardPage() {
  // 1. Fetch local applications
  const localApps = await getLocalApplications()

  // 2. Fetch Supabase applications if configured
  let supabaseApps: ApplicationPayload[] = []
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

  if (supabaseUrl && !supabaseUrl.includes('placeholder.supabase.co')) {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && Array.isArray(data)) {
        supabaseApps = data
      }
    } catch (e) {
      // Supabase is offline or paused; fallback to local apps
    }
  }

  // Merge and deduplicate by phone + brand
  const map = new Map<string, ApplicationPayload>()
  for (const app of [...localApps, ...supabaseApps]) {
    const key = `${app.whatsapp_number}_${app.brand_name}_${app.created_at?.slice(0, 16)}`
    if (!map.has(key)) {
      map.set(key, app)
    }
  }

  const applications = Array.from(map.values()).sort(
    (a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
  )

  return (
    <div className="min-h-screen bg-[#141210] text-[#F7ECEF] p-4 md:p-8" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1d1a17] border border-[#2a2622] rounded-3xl p-6 shadow-xl">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest bg-[#FFD400] text-[#111] px-3 py-1 rounded-full">
                City Mela Admin
              </span>
              <span className="text-xs text-[#a39b8f]">Live Submissions</span>
            </div>
            <h1 className="font-extrabold text-3xl md:text-4xl text-white mt-2">
              Form Fillup &amp; Space Enquiries
            </h1>
            <p className="text-sm text-[#a39b8f] mt-1">
              All stall bookings, vendor applications, and enquiries submitted across City Mela festivals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-[#2a2622] hover:bg-[#38332e] text-[#d8d2c8] px-4 py-2.5 rounded-full text-sm font-semibold transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </a>
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-[#FFD400] hover:bg-[#e6bf00] text-[#111] px-5 py-2.5 rounded-full text-sm font-bold transition shadow-md"
            >
              ← View Landing Page
            </a>
          </div>
        </header>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1d1a17] border border-[#2a2622] rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#a39b8f] uppercase tracking-wider font-semibold">Total Submissions</span>
              <div className="text-3xl font-extrabold text-white mt-1">{applications.length}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFD400]/10 text-[#FFD400] flex items-center justify-center font-bold">
              <Store className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#1d1a17] border border-[#2a2622] rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#a39b8f] uppercase tracking-wider font-semibold">Storage Location</span>
              <div className="text-sm font-bold text-[#F2B705] mt-1.5">
                data/applications.json
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#F2B705]/10 text-[#F2B705] flex items-center justify-center font-bold">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-[#1d1a17] border border-[#2a2622] rounded-2xl p-5 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#a39b8f] uppercase tracking-wider font-semibold">Instant Action</span>
              <div className="text-sm font-bold text-[#1F9D55] mt-1.5">
                1-Click WhatsApp Chat
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#1F9D55]/10 text-[#1F9D55] flex items-center justify-center font-bold">
              <MessageCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-[#1d1a17] border border-[#2a2622] rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-[#2a2622] flex flex-wrap justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#FFD400]" />
              Received Applications ({applications.length})
            </h2>
            <span className="text-xs text-[#a39b8f]">
              Saved automatically on each submission
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-[#24201c] text-[#a39b8f] border-b border-[#2a2622]">
                <tr>
                  <th className="px-5 py-4 font-semibold">Date &amp; Time</th>
                  <th className="px-5 py-4 font-semibold">Brand / Business</th>
                  <th className="px-5 py-4 font-semibold">Contact Person</th>
                  <th className="px-5 py-4 font-semibold">Category / Notes</th>
                  <th className="px-5 py-4 font-semibold">Source</th>
                  <th className="px-5 py-4 font-semibold text-right">Connect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2622]">
                {applications.length > 0 ? (
                  applications.map((app: ApplicationPayload, idx: number) => {
                    const waText = `Hi ${app.contact_name}, thank you for your space enquiry for ${app.brand_name} at City Mela.`
                    const waUrl = `https://wa.me/91${app.whatsapp_number}?text=${encodeURIComponent(waText)}`

                    return (
                      <tr key={app.id || idx} className="hover:bg-[#25211d] transition-colors">
                        <td className="px-5 py-4 text-[#a39b8f] whitespace-nowrap text-xs">
                          {formatDate(app.created_at || '')}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-white text-base">{app.brand_name}</div>
                          {app.ticket_id && (
                            <div className="inline-block px-2 py-0.5 mt-1 rounded bg-[#2a2622] text-[#FFD400] font-mono text-[11px] font-bold">
                              {app.ticket_id}
                            </div>
                          )}
                          {app.instagram_handle && (
                            <div className="text-[#FFD400] text-xs mt-0.5">{app.instagram_handle}</div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-white">{app.contact_name}</div>
                          <div className="text-xs text-[#a39b8f] mt-0.5">+91 {app.whatsapp_number}</div>
                          {app.email && (
                            <div className="text-xs text-[#FFD400]/80 mt-0.5">{app.email}</div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFD400]/20 text-[#FFD400]">
                            {app.category}
                          </span>
                          {app.additional_notes && (
                            <div className="text-xs text-[#d8d2c8] mt-1 max-w-xs break-words">
                              {app.additional_notes}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-[#a39b8f]">
                          <span className="bg-[#2a2622] px-2 py-1 rounded-md text-[11px]">
                            {app.source || 'landing'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          {app.ticket_id && (
                            <a
                              href={`/verify?id=${encodeURIComponent(app.ticket_id)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#2a2622] hover:bg-[#38332e] text-[#FFD400] rounded-full text-xs font-bold transition mr-2"
                            >
                              Scan QR
                            </a>
                          )}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1F9D55] hover:bg-[#188044] text-white rounded-full text-xs font-bold transition shadow"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Chat
                          </a>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-[#a39b8f]">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Store className="w-10 h-10 mx-auto text-[#a39b8f]/50" />
                        <p className="font-semibold text-white">No form fillup submissions yet</p>
                        <p className="text-xs">
                          When visitors fill out the form on the landing page, their details will appear here immediately and be saved in <code className="text-[#FFD400]">data/applications.json</code>.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
