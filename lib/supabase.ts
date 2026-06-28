import { createClient } from '@supabase/supabase-js'

export type SiteReport = {
  id: string
  contractor_name: string
  project_name: string
  zone: string
  work_done: string
  issues: string | null
  photo_urls: string[] | null
  submitted_at: string
  pdf_url: string | null
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
