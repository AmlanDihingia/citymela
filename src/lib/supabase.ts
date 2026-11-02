import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder.supabase.co')) {
    console.warn('Supabase URL or Anon Key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local')
  }

  return createSupabaseClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key'
  )
}

export const supabase = createClient()

export type ApplicationPayload = {
  id?: string
  ticket_id?: string
  checked_in?: boolean
  created_at?: string
  brand_name: string
  contact_name: string
  email?: string | null
  whatsapp_number: string
  instagram_handle?: string | null
  kitchen_type: string
  category: string
  hero_dishes: string
  stall_tier: string
  daily_capacity: string
  fssai_status: string
  location_area?: string | null
  additional_notes?: string | null
  source?: string
  status?: 'pending' | 'reviewed' | 'approved' | 'rejected'
}
