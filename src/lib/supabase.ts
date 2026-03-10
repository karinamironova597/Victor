import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Application = {
  id: string
  user_id: string
  full_name: string
  company_name: string
  email: string
  position: string
  status: 'pending' | 'approved' | 'rejected'
  documents: any[]
  admin_comment: string | null
  created_at: string
  updated_at: string
}

export type ApplicationDocument = {
  id: string
  application_id: string
  file_name: string
  file_url: string
  file_type: 'certificate' | 'qualification' | 'additional'
  file_size: number
  uploaded_at: string
}
