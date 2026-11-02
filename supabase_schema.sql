-- Supabase Schema for Pet Puja 2026 Vendor Applications

CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ticket_id TEXT,
    checked_in BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    brand_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT,
    whatsapp_number TEXT NOT NULL,
    instagram_handle TEXT,
    kitchen_type TEXT NOT NULL,
    category TEXT NOT NULL,
    hero_dishes TEXT NOT NULL,
    stall_tier TEXT NOT NULL,
    daily_capacity TEXT NOT NULL,
    fssai_status TEXT NOT NULL,
    location_area TEXT,
    additional_notes TEXT,
    source TEXT DEFAULT 'direct',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected'))
);

-- Migrations for existing tables:
-- ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS email TEXT;
-- ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS ticket_id TEXT;
-- ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT FALSE;

-- Enable Row Level Security (RLS)
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts so public users can submit application forms
CREATE POLICY "Allow public inserts" ON public.applications
    FOR INSERT
    WITH CHECK (true);

-- Allow select for authenticated users / service roles (or admins)
CREATE POLICY "Allow admin read access" ON public.applications
    FOR SELECT
    USING (true);
