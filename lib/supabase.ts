import { createClient } from '@supabase/supabase-js'

// اگر کلیدها نبودن، یه مقدار الکی می‌ذاریم تا بیلد فیل نشه
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// فقط یه لاگ میندازیم که بفهمیم چی شده، ولی ارور نمیدیم که بیلد متوقف بشه
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('⚠️ در حال بیلد بدون کلیدهای واقعی Supabase هستیم (طبیعی است)');
}