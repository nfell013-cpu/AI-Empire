import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

// Supabase client for server-side operations (storage, realtime, etc.)
// Note: Primary database access is through Prisma ORM
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
