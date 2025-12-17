'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Clock, ArrowLeft, Sparkles, Send, CheckCircle2 } from 'lucide-react';
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
    setTimeout(() => setRequestStatus('idle'), 3000);
    setRequestUrl('');
  };

  const filtered = articles.filter(a => a.title.includes(searchQuery));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-vazir relative overflow-x-hidden" dir="rtl">
      
      {/* نورهای پس‌زمینه */}
      <div className="fixed top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-green-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
        
        {/* هدر سایت */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/5 border border-green-500/10 text-green-400 text-xs font-bold mb-8 animate-pulse shadow-[0_0_20px_-5px_rgba(34,197,94,0.2)]">
            <Sparkles size={14}/> <span>دنیای تکنولوژی بی‌پایان است</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-tight text-white drop-shadow-2xl">
            بهترین مقالات جهان<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">به زبان شیرین فارسی</span>
          </h1>
          
          <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto leading-8 font-light">
            ما مقالات برتر Medium را با کمک هوش مصنوعی ترجمه و بازنویسی می‌کنیم تا شما بدون مانع زبانی، به‌روز بمانید.
          </p>

          {/* جستجو */}
          <div className="relative max-w-lg mx-auto group">
            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center glass rounded-2xl px-2 py-2 focus-within:border-green-500/50 transition-all">
              <Search className="text-gray-500 mr-3" size={22}/>
              <input 
                type="text" 
                placeholder="جستجو در مقالات..." 
                className="bg-transparent border-none outline-none text-white w-full h-10 px-2 placeholder-gray-500 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* لیست مقالات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
          {filtered.map((article) => (
            <Link key={article.id} href={`/article?id=${article.slug || article.id}`} className="group relative flex flex-col bg-[#0a0a0a] border border-white/5 rounded-[2rem] overflow-hidden hover:border-green-500/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-15px_rgba(34,197,94,0.15)]">
              
              <div className="aspect-[16/10] relative overflow-hidden">
                <img src={article.cover_url || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />
                <span className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-bold text-green-400 border border-white/10 shadow-lg">
                  {article.category}
                </span>
              </div>

              <div className="p-7 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-4 text-gray-100 group-hover:text-green-400 transition-colors line-clamp-2 leading-snug">
                  {article.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-3 mb-6 leading-7 flex-1 font-light">
                  {article.summary}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-5 mt-auto">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-green-500/80"/> {article.read_time}</span>
                  </div>
                  <span className="text-white flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg group-hover:bg-green-500 group-hover:text-black transition-all font-bold">
                    مطالعه <ArrowLeft size={14}/>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* باکس درخواست */}
        <div className="relative max-w-3xl mx-auto">
           <div className="absolute inset-0 bg-green-500/10 blur-3xl rounded-full pointer-events-none" />
           <div className="relative glass rounded-[2.5rem] p-8 md:p-12 text-center border border-white/10">
             <h2 className="text-2xl font-black mb-4 text-white">درخواست ترجمه مقاله</h2>
             <p className="text-gray-400 mb-8 text-sm max-w-md mx-auto leading-7">لینک مقاله مدیوم را وارد کنید. اگر مفید باشد، ترجمه و در سایت قرار می‌گیرد.</p>
             
             <div className="flex flex-col sm:flex-row gap-3">
               <input 
                 type="text" 
                 placeholder="https://medium.com/..." 
                 className="flex-1 bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-left dir-ltr focus:border-green-500 outline-none transition-colors text-white placeholder-gray-600" 
                 value={requestUrl} 
                 onChange={(e) => setRequestUrl(e.target.value)} 
               />
               <button 
                 onClick={submitRequest} 
                 disabled={requestStatus !== 'idle'} 
                 className={`px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${requestStatus === 'success' ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]'}`}
               >
                 {requestStatus === 'loading' ? '...' : requestStatus === 'success' ? <CheckCircle2/> : <Send size={20}/>}
               </button>
             </div>
           </div>
        </div>

      </main>
    </div>
  );
}