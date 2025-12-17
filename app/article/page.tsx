'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Clock, Calendar, ArrowLeft, AlertTriangle, BookOpen, Home } from 'lucide-react';
import Link from 'next/link';
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

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-8 h-8 border-2 border-green-500 rounded-full animate-spin border-t-transparent"></div></div>;
  if (!article) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">یافت نشد</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-vazir pb-20" dir="rtl">
      
      {/* 
         پروگرس بار اصلاح شده:
         origin-right: یعنی از راست به چپ پر شود (چون فارسی است)
         z-index بالا دارد تا روی نوبار نیفتد ولی دیده شود
      */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-green-500 z-[100] shadow-[0_0_15px_rgba(34,197,94,0.7)]" 
        style={{ scaleX, transformOrigin: "right" }} 
      />
      
      <Navbar />

      <article className="max-w-4xl mx-auto px-6 mt-32">
        <div className="glass rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden">
          
          {/* نور پس‌زمینه مقاله */}
          <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none"></div>
          
          <header className="mb-12 text-center relative z-10">
            <span className="text-green-400 text-xs font-bold bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/10 mb-6 inline-block">{article.category}</span>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-8 leading-tight tracking-tight">{article.title}</h1>
            <div className="flex justify-center items-center gap-6 text-gray-500 text-xs font-medium border-t border-b border-white/5 py-4 w-fit mx-auto px-10">
              <span className="flex items-center gap-2"><Clock size={14}/> {article.read_time}</span>
              <span>{new Date(article.created_at).toLocaleDateString('fa-IR')}</span>
            </div>
          </header>

          {article.cover_url && (
            <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl border border-white/5">
                <img src={article.cover_url} className="w-full h-auto object-cover hover:scale-105 transition-transform duration-1000" alt="cover"/>
            </div>
          )}

          {/* متن مقاله */}
          <div className="prose prose-lg prose-invert max-w-none 
                prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                prose-p:text-gray-300 prose-p:leading-9 prose-p:font-light
                prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-green-200
                prose-code:text-green-300 prose-code:bg-transparent prose-code:font-mono
                relative z-10 text-justify">
            <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {article.content}
            </ReactMarkdown>
          </div>

          <div className="mt-20 pt-10 border-t border-white/5 text-center">
             <a href={article.source_url} target="_blank" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-400 transition-colors text-sm font-medium">
                مشاهده منبع اصلی در Medium <ArrowLeft size={14}/>
             </a>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function ArticlePage() {
  return <Suspense fallback={null}><ArticleViewer /></Suspense>;
}