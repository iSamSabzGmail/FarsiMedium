import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ خطای مهم: کلیدهای Supabase در فایل .env.local پیدا نشدند!')
  // برای جلوگیری از کرش کامل، یک کلاینت الکی می‌سازیم (ولی باید فایل env را درست کنی)
  throw new Error('Supabase Url or Key is missing');
}

export const supabase = createClient(supabaseUrl, supabaseKey)