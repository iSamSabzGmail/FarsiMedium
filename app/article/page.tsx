'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Clock, Calendar, ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { motion, useScroll, useSpring } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css'; 
import Navbar from '@/components/Navbar'; // استفاده از نوبار اصلی

function ArticleViewer() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('id');
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll();
  // حذف useSpring برای دقت بیشتر یا تنظیم دقیق فنر
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    if (!slug) return;
    const fetch = async () => {
      let { data } = await supabase.from('articles').select('*').eq('slug', slug).single();
      if (!data) { const { data: d2 } = await supabase.from('articles').select('*').eq('id', slug).single(); data = d2; }
      setArticle(data);
      setLoading(false);
    };
    fetch();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-500 rounded-full animate-spin border-t-transparent"></div></div>;
  if (!article) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">یافت نشد</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-vazir pb-20" dir="rtl">
      
      {/* 
         ✅ اصلاح نوار سبز: 
         initial={{ scaleX: 0 }} -> باعث میشه اولش خالی باشه
         origin-right -> باعث میشه از راست پر بشه (برای فارسی)
      */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-green-500 z-[100] shadow-[0_0_15px_rgba(34,197,94,0.8)] origin-right" 
        style={{ scaleX }}
        initial={{ scaleX: 0 }} 
      />
      
      {/* استفاده از نوبار اصلی سایت */}
      <Navbar />

      <article className="max-w-4xl mx-auto px-4 md:px-6 mt-32">
        <div className="glass rounded-[2rem] p-8 md:p-14 relative overflow-hidden border border-white/5">
          
          {/* نور پس‌زمینه */}
          <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none"></div>
          
          <header className="mb-12 text-center relative z-10">
            <span className="text-green-400 text-xs font-bold bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/10 mb-6 inline-block shadow-[0_0_15px_-5px_rgba(34,197,94,0.3)]">{article.category}</span>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight tracking-tighter">{article.title}</h1>
            
            <div className="flex justify-center items-center gap-8 text-gray-500 text-xs font-bold border-t border-b border-white/5 py-5 w-fit mx-auto px-12">
              <span className="flex items-center gap-2"><Clock size={16} className="text-green-500"/> {article.read_time}</span>
              <span>{new Date(article.created_at).toLocaleDateString('fa-IR')}</span>
            </div>
          </header>

          {article.cover_url && (
            <div className="mb-14 rounded-3xl overflow-hidden shadow-2xl border border-white/5 relative group">
                <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay"></div>
                <img src={article.cover_url} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000" alt="cover"/>
            </div>
          )}

          {/* متن اصلی */}
          <div className="prose prose-lg prose-invert max-w-none 
                prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tighter
                prose-p:text-gray-300 prose-p:leading-10 prose-p:font-light prose-p:text-justify
                prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white prose-strong:font-bold
                prose-code:text-green-300 prose-code:bg-[#111] prose-code:px-1 prose-code:rounded prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                relative z-10">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {article.content}
            </ReactMarkdown>
          </div>

          <div className="mt-24 pt-10 border-t border-white/5 text-center">
             {article.source_url && (
               <a href={article.source_url} target="_blank" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-400 transition-colors text-sm font-bold border border-white/5 px-6 py-3 rounded-xl hover:bg-white/5 hover:border-green-500/30">
                  منبع اصلی مقاله <ArrowLeft size={16}/>
               </a>
             )}
          </div>
        </div>
      </article>
    </div>
  );
}

export default function ArticlePage() {
  return <Suspense fallback={null}><ArticleViewer /></Suspense>;
}