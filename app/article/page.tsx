'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Clock, Calendar, BookOpen, Share2, Home, Copy, Check, ArrowLeft, AlertTriangle, Send } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';

// --- ابزارهای نمایش متن و کد ---
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
// 👇 این خط جادویی است که کدها را رنگی می‌کند 👇
import 'highlight.js/styles/atom-one-dark.css'; 

interface Article {
  id: string; title: string; summary: string; content: string; cover_url: string | null; category: string | null; author: string | null; created_at: string; read_time: string | null; slug: string | null; source_url: string | null;
}

function ArticleViewer() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('id');

  const [article, setArticle] = useState<Article | null>(null);
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
      }
      setLoading(false);
    }
    fetchData();
  }, [slug]);

  const copyLink = () => { navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const shareTo = (platform: string) => { const url = encodeURIComponent(window.location.href); if (platform === 'telegram') window.open(`https://t.me/share/url?url=${url}`, '_blank'); setShowShareMenu(false); };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white"><div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!article) return <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-gray-400 gap-4"><AlertTriangle size={40}/> <p>مقاله‌ای یافت نشد.</p><Link href="/" className="text-green-500 hover:underline">بازگشت به خانه</Link></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-vazir pb-20" dir="rtl">
      {/* نوار پیشرفت مطالعه بالای صفحه */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-green-500 origin-right z-[60] shadow-[0_0_10px_#22c55e]" style={{ scaleX }} />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 py-4 px-4">
         <div className="max-w-7xl mx-auto h-16 flex items-center justify-between bg-[#111]/80 backdrop-blur-xl rounded-2xl border border-white/5 px-6 shadow-2xl">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-white text-black p-1.5 rounded-lg"><BookOpen size={18} strokeWidth={3} /></div>
              <span className="text-lg font-black tracking-tighter text-white">مدیوم<span className="text-green-500">فارسی</span></span>
            </Link>
            <div className="flex gap-2 relative">
              <Link href="/" className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-green-400 transition-colors"><Home size={20} /></Link>
              <div className="relative">
                <button onClick={() => setShowShareMenu(!showShareMenu)} className={`p-2 rounded-full transition-colors ${showShareMenu ? 'bg-green-600 text-white' : 'hover:bg-white/5 text-gray-400'}`}><Share2 size={20} /></button>
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

      <article className="max-w-5xl mx-auto px-4 md:px-8 mt-6">
        
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-64 bg-gradient-to-b from-green-900/10 to-transparent pointer-events-none"></div>
          
          <header className="mb-10 space-y-6 relative z-10 text-center md:text-right">
            <span className="inline-block bg-green-500/10 text-green-400 px-4 py-1.5 rounded-xl text-sm font-bold border border-green-500/20">{article.category || 'عمومی'}</span>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">{article.title}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-gray-400 text-sm border-b border-white/5 pb-8">
              <span className="flex items-center gap-1.5"><Clock size={16} /> {article.read_time}</span>
              <span className="flex items-center gap-1.5"><Calendar size={16} /> {article.created_at ? new Date(article.created_at).toLocaleDateString('fa-IR') : ''}</span>
            </div>
          </header>

          {article.cover_url && <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl border border-white/5"><img src={article.cover_url} alt={article.title} className="w-full h-auto object-cover max-h-[600px] w-full" /></div>}

          <div className="mb-12 bg-[#111] border-r-4 border-green-500 rounded-xl p-6 relative z-10">
            <h3 className="text-green-400 font-bold mb-3 text-lg">خلاصه مقاله</h3>
            <p className="text-gray-300 leading-loose text-justify">{article.summary}</p>
          </div>

          {/* 
             بخش اصلی نمایش محتوا
             کلاس prose-invert برای دارک مود است
             و rehypeHighlight برای رنگی کردن کدها
          */}
          <div className="prose prose-lg prose-invert max-w-none prose-p:leading-9 prose-p:text-gray-300 prose-headings:text-white prose-a:text-green-400 prose-strong:text-green-300 prose-code:text-green-300 prose-pre:bg-[#151515] relative z-10 dir-rtl text-justify">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {article.content}
            </ReactMarkdown>
          </div>

          <div className="mt-20 pt-10 border-t border-white/5 relative z-10 text-center">
             {article.source_url && <a href={article.source_url} target="_blank" className="inline-flex items-center gap-2 text-green-500 hover:text-green-400 font-bold border border-green-500/30 px-6 py-3 rounded-xl hover:bg-green-500/10 transition-all">مشاهده منبع اصلی در Medium <ArrowLeft size={18}/></a>}
          </div>
        </div>
      </article>
    </div>
  );
}

export default function ArticlePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center text-white"><div className="w-10 h-10 border-4 border-green-500 rounded-full animate-spin border-t-transparent"></div></div>}>
      <ArticleViewer />
    </Suspense>
  );
}