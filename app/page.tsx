'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Sparkles, ArrowLeft, Clock, TrendingUp, Send, CheckCircle2, Zap } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [requestUrl, setRequestUrl] = useState('');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    supabase.from('articles').select('id, title, summary, category, created_at, cover_url, slug, read_time')
      .eq('published', true).order('created_at', { ascending: false })
      .then(({ data }) => setArticles(data || []));
  }, []);

  const submitRequest = async () => {
    if (!requestUrl) return;
    setRequestStatus('loading');
    await supabase.from('requests').insert([{ url: requestUrl }]);
    setRequestStatus('success');
    setTimeout(() => setRequestStatus('idle'), 2000);
    setRequestUrl('');
  };

  const filtered = articles.filter(a => a.title.includes(searchQuery));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-vazir relative overflow-hidden" dir="rtl">
      
      {/* نورهای پس‌زمینه (Glow) */}
      <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-green-500/10 blur-[150px] rounded-full pointer-events-none" />
      
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32 relative z-10">
        
        {/* هدر اصلی */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold mb-6 animate-pulse">
            <Zap size={14} fill="currentColor"/> <span>پلتفرم آموزش مدرن</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-tight">
            مرجع تخصصی <span className="text-transparent bg-clip-text bg-gradient-to-l from-green-400 to-emerald-600">مقالات تکنولوژی</span>
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            دسترسی به جدیدترین مقالات برنامه‌نویسی و هک از منابع معتبر جهانی (Medium) با ترجمه تخصصی فارسی.
          </p>

          {/* جستجو */}
          <div className="relative max-w-xl mx-auto group">
            <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-[#111] border border-white/10 rounded-2xl p-1 focus-within:border-green-500/50 transition-all">
              <Search className="mr-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="جستجو در بین مقالات..." 
                className="w-full bg-transparent border-none outline-none text-white placeholder-gray-600 py-3 px-2 font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* لیست مقالات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {filtered.map((article) => (
            <Link key={article.id} href={`/article?id=${article.slug || article.id}`} className="group relative block bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden hover:border-green-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_-10px_rgba(34,197,94,0.15)] flex flex-col h-full">
              <div className="aspect-[16/9] relative overflow-hidden">
                <img src={article.cover_url || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur border border-white/10 px-3 py-1 rounded-lg text-[10px] font-bold text-green-400">{article.category}</div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-3 leading-snug text-gray-100 group-hover:text-green-400 transition-colors line-clamp-2">{article.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-6 flex-1">{article.summary}</p>
                <div className="flex items-center justify-between text-xs font-bold text-gray-600 border-t border-white/5 pt-4">
                  <span className="flex items-center gap-1"><Clock size={14}/> {article.read_time}</span>
                  <span className="flex items-center gap-1 text-green-500 group-hover:translate-x-1 transition-transform">مطالعه <ArrowLeft size={14}/></span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* باکس درخواست */}
        <div className="relative max-w-3xl mx-auto glass-green rounded-3xl p-8 md:p-12 text-center overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 blur-3xl rounded-full" />
           <h2 className="text-2xl font-bold mb-4">مقاله خاصی مد نظرتان است؟</h2>
           <p className="text-gray-400 mb-8 text-sm">لینک مقاله انگلیسی را وارد کنید تا ترجمه و اضافه شود.</p>
           <div className="flex gap-2">
             <input type="text" placeholder="https://medium.com/..." className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-left dir-ltr focus:border-green-500 outline-none transition-colors" value={requestUrl} onChange={(e) => setRequestUrl(e.target.value)} />
             <button onClick={submitRequest} disabled={requestStatus !== 'idle'} className="bg-green-600 hover:bg-green-500 text-white px-6 rounded-xl font-bold transition-colors disabled:opacity-50">
               {requestStatus === 'success' ? <CheckCircle2/> : <Send size={20}/>}
             </button>
           </div>
        </div>

      </main>
    </div>
  );
}