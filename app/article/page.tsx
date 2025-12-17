'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Clock, Calendar, ArrowLeft } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css'; 
import Navbar from '@/components/Navbar';

function ArticleViewer() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('id');
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { scrollYProgress } = useScroll();
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-500 rounded-full animate-spin border-t-transparent"></div></div>;
  if (!article) return <div className="min-h-screen flex items-center justify-center text-white">یافت نشد</div>;

  return (
    <div className="min-h-screen text-gray-200 font-vazir pb-20 selection:bg-green-500/30 selection:text-green-200 relative" dir="rtl">
      
      {/* --- نورپردازی سراسری (کپی شده از صفحه اصلی) --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-green-600/15 blur-[130px] rounded-full opacity-60 mix-blend-screen animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full opacity-40" />
      </div>

      {/* نوار پیشرفت */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-green-500 z-[100] shadow-[0_0_15px_rgba(34,197,94,0.8)] origin-right" 
        style={{ scaleX }}
        initial={{ scaleX: 0 }} 
      />
      
      <Navbar />

      <article className="max-w-5xl mx-auto px-4 md:px-8 mt-32 relative z-10">
        
        {/* کانتینر مقاله (حالا کاملاً شیشه‌ای است) */}
        <div className="glass rounded-[2.5rem] p-6 md:p-16 relative overflow-hidden border border-white/10">
          
          {/* پترن نقطه‌ای خیلی محو */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <header className="mb-14 text-center relative z-10">
            <span className="text-green-400 text-xs md:text-sm font-bold bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/10 mb-6 inline-block shadow-[0_0_15px_-5px_rgba(34,197,94,0.3)]">
              {article.category}
            </span>
            <h1 className="text-3xl md:text-6xl font-black text-white mb-8 leading-tight tracking-tighter max-w-4xl mx-auto drop-shadow-2xl">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 text-gray-400 text-xs md:text-sm font-bold border-t border-b border-white/5 py-6 w-full md:w-fit mx-auto px-10">
              <span className="flex items-center gap-2"><Clock size={18} className="text-green-500"/> {article.read_time}</span>
              <span>{new Date(article.created_at).toLocaleDateString('fa-IR')}</span>
            </div>
          </header>

          {article.cover_url && (
            <div className="mb-16 rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 relative group w-full aspect-video">
                <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay"></div>
                <img src={article.cover_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="cover"/>
            </div>
          )}

          {/* متن اصلی */}
          <div className="prose prose-lg md:prose-xl prose-invert max-w-none 
                prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tighter
                prose-p:text-gray-300 prose-p:leading-10 prose-p:font-light prose-p:text-justify
                prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white prose-strong:font-bold
                prose-li:text-gray-300
                relative z-10">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {article.content}
            </ReactMarkdown>
          </div>

          <div className="mt-24 pt-10 border-t border-white/5 text-center">
             {article.source_url && (
               <a href={article.source_url} target="_blank" className="inline-flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors text-sm font-bold border border-white/5 px-8 py-4 rounded-2xl hover:bg-white/5 hover:border-green-500/30 hover:shadow-lg">
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