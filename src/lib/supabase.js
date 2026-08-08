import { createClient } from '@supabase/supabase-js'

// Supabase client — disiapkan untuk koneksi ke project asli.
// Selama demo, seluruh query dilayani oleh mock data layer di src/data,
// yang sengaja meniru bentuk pemanggilan Supabase (select/insert/update)
// supaya migrasi nanti tinggal ganti implementasi, bukan ganti call-site.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export const isSupabaseConfigured = Boolean(supabase)
