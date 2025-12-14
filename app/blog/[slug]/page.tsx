import { supabase } from '@/lib/supabase';
import ArticleContent from './ArticleContent';

// این فایل سرور است و نباید "use client" داشته باشد

// ۱. تولید صفحات استاتیک (حیاتی برای output: export)
export async function generateStaticParams() {
  try {
    const { data: articles } = await supabase.from('articles').select('slug, id');
    
    // اگر مقاله‌ای نبود، آرایه خالی برمی‌گرداند (بیلد فیل نمی‌شود)
    if (!articles) return [];
    
    return articles.map((post) => ({
      slug: post.slug || post.id,
    }));
  } catch (error) {
    console.warn('⚠️ هشدار بیلد: دیتابیس در دسترس نیست (طبیعی در محیط بیلد)');
    return [];
  }
}

// ۲. رندر صفحه
export default function Page({ params }: { params: { slug: string } }) {
  // ما فقط Slug را به کامپوننت کلاینت پاس می‌دهیم
  return <ArticleContent slug={params.slug} />;
}