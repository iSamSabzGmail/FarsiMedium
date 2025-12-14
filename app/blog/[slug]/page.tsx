import { supabase } from '@/lib/supabase';
import ArticleContent from './ArticleContent'; // ایمپورت کامپوننت کلاینت

// این فایل سرور کامپوننت است و "use client" ندارد!

// ۱. تولید صفحات استاتیک (اجرا در سرور موقع بیلد)
export async function generateStaticParams() {
  try {
    const { data: articles } = await supabase.from('articles').select('slug, id');
    if (!articles) return [];
    
    return articles.map((post) => ({
      slug: post.slug || post.id,
    }));
  } catch (error) {
    console.warn('⚠️ بیلد: اتصال دیتابیس برقرار نشد (طبیعی در CI/CD)');
    return [];
  }
}

// ۲. رندر صفحه
export default function Page({ params }: { params: { slug: string } }) {
  // فقط کامپوننت کلاینت رو لود میکنیم و اسلاگ رو بهش پاس میدیم
  return <ArticleContent slug={params.slug} />;
}