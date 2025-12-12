'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Clock, Calendar, BookOpen, Share2, Home, Copy, Check, Twitter, Send, AlertTriangle, ListChecks, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';

// ... (توابع getArticleData و اینترفیس‌ها تغییری نکردن، همون قبلی‌ها) ...
// برای اینکه کد طولانی نشه، من فقط بخش Return رو اصلاح شده میزارم.
// فرض بر اینه که توابع بالا رو داری. اگر نداری بگو کامل بفرستم.

interface Article {
    id: string; title: string; summary: string; content: string; cover_url: string | null; category: string | null; author: string | null; created_at: string; read_time: string | null; slug: string | null; source_url: string | null;
}

async function getArticleData(slug: string) {
    let { data: article } = await supabase.from('articles').select('*').eq('slug', slug).single();
    if (!article) { const { data: dataById } = await supabase.from('articles').select('*').eq('id', slug).single(); article = dataById; }
    let related: Article[] = [];
    if (article) { const { data } = await supabase.from('articles').select('*').eq('category', article.category).neq('id', article.id).limit(3); if (data) related = data as Article[]; }
    return { article: article as Article, related };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<{article: Article, related: Article[]} | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    getArticleData(params.slug).then(res => {
      if (res.article) { setData(res); document.title = `${res.article.title} | مدیوم فارسی`; }
      setLoading(false);
    });
  }, [params.slug]);

  const copyLink = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const shareTo = (platform: string) => { const url = encodeURIComponent(window.location.href); if (platform === 'telegram') window.open(`https://t.me/share/url?url=${url}`, '_blank'); if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?url=${url}`, '_blank'); setShowShareMenu(false); };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!data?.article) return notFound();
  const { article, related } = data;

  return (
    <div className="min-h-screen text-gray-200 font-vazir pb-20" dir="rtl">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-right z-[60]" style={{ scaleX }} />

      {/* Navbar جدید در صفحه مقاله */}
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

      <article className="max-w-3xl mx-auto px-4 mt-6">
        {/* باکس اصلی مقاله: رنگ تیره‌تر برای خوانایی بهتر */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
          
          {/* نور ملایم پشت متن برای زیبایی ولی کم‌رنگ */}
          <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>

          <header className="mb-8 space-y-6 relative z-10">
            <Link href="/" className="inline-block bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-sm font-bold border border-blue-500/20">{article.category || 'عمومی'}</Link>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm border-b border-white/5 pb-8">
              <span className="font-bold text-white flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-300">{article.author?.[0]}</div>{article.author}</span>
              <span className="flex items-center gap-1.5"><Clock size={16} /> {article.read_time}</span>
              <span className="flex items-center gap-1.5"><Calendar size={16} /> {new Date(article.created_at).toLocaleDateString('fa-IR')}</span>
            </div>
          </header>

          {article.cover_url && <div className="mb-10 rounded-3xl overflow-hidden shadow-lg border border-white/5"><img src={article.cover_url} alt={article.title} className="w-full h-auto object-cover" /></div>}

          <div className="mb-10 bg-[#111] border-r-4 border-blue-600 rounded-xl p-6">
            <div className="flex items-center gap-2 text-blue-400 font-bold mb-3"><ListChecks size={20} /><h3>خلاصه ۳۰ ثانیه‌ای</h3></div>
            <p className="text-gray-300 leading-relaxed text-sm">{article.summary}</p>
          </div>

          {/* متن اصلی: رنگ متن روشن‌تر و پس‌زمینه تیره */}
          <div className="prose prose-lg prose-invert max-w-none prose-p:leading-8 prose-p:text-gray-300 prose-headings:text-white prose-a:text-blue-400">
            {article.content ? article.content.split('\n').map((paragraph: string, index: number) => {
               if (paragraph.startsWith('# ')) return <h1 key={index} className="mt-12 mb-6">{paragraph.replace('# ', '')}</h1>;
               if (paragraph.startsWith('## ')) return <h2 key={index} className="mt-10 mb-4 text-blue-100">{paragraph.replace('## ', '')}</h2>;
               if (paragraph.startsWith('- ')) return <li key={index} className="list-disc mr-4 mb-2 text-gray-300">{paragraph.replace('- ', '')}</li>;
               if (paragraph.includes('منبع:')) return null;
               return <p key={index} className="mb-6">{paragraph}</p>;
            }) : <p>محتوایی نیست.</p>}
          </div>

          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="bg-white/5 rounded-xl p-4 text-xs text-gray-500 flex gap-3 items-start leading-5">
              <AlertTriangle size={24} className="text-yellow-600 shrink-0" />
              <div>
                <p className="mb-2 font-bold text-gray-400">سلب مسئولیت:</p>
                <p>این مطلب بازنویسی شده است. {article.source_url && <a href={article.source_url} target="_blank" className="text-blue-500 hover:underline">منبع اصلی</a>}</p>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3"><span className="w-1 h-8 bg-blue-500 rounded-full"></span>پیشنهاد مطالعه</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug || post.id}`} className="group bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all">
                  <div className="aspect-video relative">
                    {post.cover_url && <img src={post.cover_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>}
                    <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-lg text-[10px] text-white backdrop-blur">{post.category}</div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-gray-200 line-clamp-2 group-hover:text-blue-400 transition-colors">{post.title}</h4>
                    <div className="flex items-center gap-1 text-blue-400 text-xs mt-3 font-bold">بخوانید <ArrowLeft size={14}/></div>
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