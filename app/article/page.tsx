'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Clock, Calendar, BookOpen, Share2, Home, Copy, Check, Twitter, Send, AlertTriangle, ListChecks, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';

interface Article {
  id: string; title: string; summary: string; content: string; cover_url: string | null; category: string | null; author: string | null; created_at: string; read_time: string | null; slug: string | null; source_url: string | null;
}

function ArticleViewer() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('id');

  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    if (!slug) return;
    async function fetchData() {
      setLoading(true);
      let { data: art } = await supabase.from('articles').select('*').eq('slug', slug).single();
      if (!art) {
         const { data: artById } = await supabase.from('articles').select('*').eq('id', slug).single();
         art = artById;
      }
      if (art) {
        setArticle(art as Article);
        document.title = `${art.title} | مدیوم فارسی`;
        const { data: rel } = await supabase.from('articles').select('*').eq('category', art.category).neq('id', art.id).limit(3);
        if (rel) setRelated(rel as Article[]);
      }
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  const copyLink = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const shareTo = (platform: string) => { const url = encodeURIComponent(window.location.href); if (platform === 'telegram') window.open(`https://t.me/share/url?url=${url}`, '_blank'); if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?url=${url}`, '_blank'); setShowShareMenu(false); };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!article) return <div className="min-h-screen flex flex-col items-center justify-center text-gray-400 gap-4"><AlertTriangle size={40}/> <p>مقاله‌ای یافت نشد.</p><Link href="/" className="text-blue-500 hover:underline">بازگشت به خانه</Link></div>;

  return (
    <div className="min-h-screen text-gray-200 font-vazir pb-20" dir="rtl">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-right z-[60]" style={{ scaleX }} />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 py-4 px-4">
         <div className="max-w-7xl mx-auto h-16 flex items-center justify-between bg-[#111]/80 backdrop-blur-xl rounded-2xl border border-white/10 px-6 shadow-2xl">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-white text-black p-1.5 rounded-lg"><BookOpen size={18} strokeWidth={3} /></div>
              <span className="text-lg font-black tracking-tighter text-white">مدیوم<span className="text-blue-500">فارسی</span></span>
            </Link>
            <div className="flex gap-2 relative">
              <Link href="/" className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"><Home size={20} /></Link>
              <div className="relative">
                <button onClick={() => setShowShareMenu(!showShareMenu)} className={`p-2 rounded-full transition-colors ${showShareMenu ? 'bg-blue-600 text-white' : 'hover:bg-white/10 text-gray-400'}`}><Share2 size={20} /></button>
                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 top-12 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl p-2 w-48 flex flex-col gap-1 z-50">
                      <button onClick={() => shareTo('telegram')} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-gray-300 hover:text-blue-400"><Send size={16} /> تلگرام</button>
                      <button onClick={copyLink} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-sm text-gray-300 hover:text-green-400">{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'کپی شد!' : 'کپی لینک'}</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
         </div>
      </nav>

      {/* 👇👇👇 تغییرات عرض صفحه اینجاست 👇👇👇 */}
      {/* قبلا max-w-3xl بود، الان max-w-6xl شد تا پهن‌تر بشه */}
      {/* px-4 برای موبایل و md:px-8 برای تبلت و دسکتاپ که از بغل نچسبه */}
      <article className="max-w-6xl mx-auto px-4 md:px-8 mt-6">
        
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
          
          <header className="mb-10 space-y-6 relative z-10 text-center md:text-right">
            <Link href="/" className="inline-block bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-xl text-sm font-bold border border-blue-500/20">{article.category || 'عمومی'}</Link>
            <h1 className="text-3xl md:text-6xl font-black text-white leading-tight">{article.title}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-gray-400 text-sm border-b border-white/5 pb-8">
              <span className="font-bold text-white flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-300 font-bold">{article.author?.[0]}</div>{article.author}</span>
              <span className="flex items-center gap-1.5"><Clock size={16} /> {article.read_time}</span>
              <span className="flex items-center gap-1.5"><Calendar size={16} /> {new Date(article.created_at).toLocaleDateString('fa-IR')}</span>
            </div>
          </header>

          {article.cover_url && <div className="mb-12 rounded-3xl overflow-hidden shadow-lg border border-white/5"><img src={article.cover_url} alt={article.title} className="w-full h-auto object-cover max-h-[600px] w-full" /></div>}

          <div className="mb-12 bg-blue-900/10 border border-blue-500/20 rounded-2xl p-6 relative z-10">
            <div className="flex items-center gap-2 text-blue-300 font-bold mb-3"><ListChecks size={22} /><h3>خلاصه ۳۰ ثانیه‌ای</h3></div>
            <p className="text-gray-300 leading-loose text-base md:text-lg">{article.summary}</p>
          </div>

          {/* متن مقاله: max-w-none رو اضافه کردم تا کل عرض رو پر کنه */}
          <div className="prose prose-lg md:prose-xl prose-invert max-w-none prose-p:leading-10 prose-p:text-gray-300 prose-headings:text-white prose-a:text-blue-400 relative z-10">
            {article.content ? article.content.split('\n').map((paragraph: string, index: number) => {
               if (paragraph.startsWith('# ')) return <h1 key={index} className="mt-16 mb-8 font-black">{paragraph.replace('# ', '')}</h1>;
               if (paragraph.startsWith('## ')) return <h2 key={index} className="mt-12 mb-6 text-blue-100 border-r-4 border-blue-600 pr-4">{paragraph.replace('## ', '')}</h2>;
               if (paragraph.startsWith('- ')) return <li key={index} className="list-disc mr-6 mb-3 text-gray-300">{paragraph.replace('- ', '')}</li>;
               if (paragraph.includes('منبع:')) return null;
               return <p key={index} className="mb-8">{paragraph}</p>;
            }) : <p>محتوایی نیست.</p>}
          </div>

          <div className="mt-20 pt-10 border-t border-white/10 relative z-10">
            <div className="bg-white/5 rounded-2xl p-6 text-sm text-gray-500 flex gap-4 items-start leading-6">
              <AlertTriangle size={28} className="text-yellow-600 shrink-0" />
              <div>
                <p className="mb-2 font-bold text-gray-300 text-base">سلب مسئولیت کپی‌رایت:</p>
                <p>این مطلب بازنویسی و خلاصه شده است. تمامی حقوق متعلق به نویسنده اصلی است. {article.source_url && <a href={article.source_url} target="_blank" className="text-blue-500 hover:underline font-bold">مشاهده منبع اصلی در Medium</a>}</p>
              </div>
            </div>
          </div>
        </div>

        {/* مقالات مرتبط (۳ ستونه در دسکتاپ، ۱ ستونه در موبایل) */}
        {related.length > 0 && (
          <div className="mt-24">
            <h3 className="text-3xl font-black text-white mb-10 flex items-center gap-3"><span className="w-1.5 h-8 bg-blue-500 rounded-full"></span>پیشنهاد مطالعه</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((post) => (
                <Link key={post.id} href={`/article?id=${post.slug || post.id}`} className="group bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden hover:border-blue-500/40 transition-all hover:-translate-y-2 shadow-xl">
                  <div className="aspect-video relative">
                    {post.cover_url && <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>}
                    <div className="absolute top-3 right-3 bg-black/70 px-3 py-1 rounded-xl text-xs text-white backdrop-blur border border-white/10">{post.category}</div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-lg text-gray-200 line-clamp-2 group-hover:text-blue-400 transition-colors leading-snug">{post.title}</h4>
                    <div className="flex items-center gap-1 text-blue-400 text-sm mt-4 font-bold">بخوانید <ArrowLeft size={16}/></div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

export default function ArticlePage() {
  return (
    <Suspense fallback={<div className="text-white text-center mt-20 flex flex-col items-center gap-2"><div className="w-8 h-8 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div><p>در حال بارگذاری...</p></div>}>
      <ArticleViewer />
    </Suspense>
  );
}