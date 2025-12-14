import { createClient } from '@supabase/supabase-js'

// اگر کلیدها توی محیط نبودن (مثل موقع بیلد گیت‌هاب)، یه چیز الکی میذاریم که ارور نده
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);