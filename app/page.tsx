// --- START OF FILE app/page.tsx ---

'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Clock, ArrowLeft, Sparkles, Send, CheckCircle2, Zap, Layers } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

// لیست عکس‌های پیش‌فرض (اگر مقاله‌ای عکس نداشت)
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80", // تکنولوژی
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80", // امنیت
  "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80", // کدنویسی
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80", // هوش مصنوعی
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80", // تیم و کار
];

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['همه']); // لیست دینامیک
  const [searchQuery, setSearchQuery] = useState('');
  const [requestUrl, setRequestUrl] = useState('');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  
  const [selectedCategory, setSelectedCategory] = useState('همه');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase
      .from('articles')
      .select('id, title, summary, category, created_at, cover_url, slug, read_time')
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    if (data) {
      setArticles(data);
      
      // ⚡️ استخراج خودکار دسته‌بندی‌ها از مقالات موجود
      const uniqueCategories = Array.from(new Set(data.map(a => a.category).filter(Boolean)));
      setCategories(['همه', ...uniqueCategories]);
    }
  };

  const submitRequest = async () => {
    if (!requestUrl) return;
    setRequestStatus('loading');
    await supabase.from('requests').insert([{ url: requestUrl }]);
    setRequestStatus('success');
    setTimeout(() => setRequestStatus('idle'), 3000);
    setRequestUrl('');
  };

  // فیلتر ترکیبی
  const filtered = articles.filter(a => {
    const matchesSearch = a.title.includes(searchQuery);
    const matchesCategory = selectedCategory === 'همه' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen text-white font-vazir relative selection:bg-green-500/30 selection:text-green-200" dir="rtl">
      
      {/* نورپردازی */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-green-600/15 blur-[130px] rounded-full opacity-60 mix-blend-screen animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full opacity-40" />
          <div className="absolute top-[40%] left-[-20%] w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full opacity-30" />
      </div>
      
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-20 relative z-10">
        
        {/* --- هیرو --- */}
        <div className="text-center max-w-5xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-green-400 text-xs font-bold mb-8 shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)] border-green-500/20">
            <Zap size={14} fill="currentColor"/> <span>پلتفرم جامع تکنولوژی</span>
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-tight text-white drop-shadow-2xl">
            یادگیری <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-green-200 to-green-500">بی‌نهایت</span><br/>
            در دنیای <span className="text-green-500">فناوری</span>
          </h1>
          
          <p className="text-gray-300/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-9 font-light">
            بهترین مقالات Medium را در حوزه‌های تکنولوژی، هوش مصنوعی و توسعه فردی گلچین و ترجمه می‌کنیم.
          </p>

          <div className="relative max-w-2xl mx-auto group">
            <div className="absolute inset-0 bg-green-500/30 blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative flex items-center glass rounded-2xl px-4 py-3 focus-within:border-green-500/50 transition-all shadow-2xl">
              <Search className="text-gray-400 mr-2" size={24}/>
              <input 
                type="text" 
                placeholder="جستجو کنید..." 
                className="bg-transparent border-none outline-none text-white w-full h-full px-2 placeholder-gray-500 text-lg font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* --- تب‌های دسته‌بندی (اتوماتیک) --- */}
        <div className="mb-12 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex justify-center gap-3 min-w-max px-4">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap ${
                            selectedCategory === cat 
                            ? 'bg-green-600 text-white border-green-500 shadow-[0_0_20px_-5px_rgba(34,197,94,0.6)]' 
                            : 'glass text-gray-400 border-white/5 hover:text-white hover:border-white/20'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {/* --- لیست مقالات --- */}
        {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
            {filtered.map((article, index) => (
                <Link key={article.id} href={`/article?id=${article.slug || article.id}`} className="group relative flex flex-col glass rounded-[2.5rem] overflow-hidden hover:-translate-y-2 transition-all duration-500">
                
                <div className="aspect-[16/10] relative overflow-hidden m-2 rounded-[2rem]">
                    {/* ⚡️ نمایش عکس پیش‌فرض اگر کاور نداشت */}
                    <img 
                      src={article.cover_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    <span className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-bold text-white border border-white/10 shadow-lg">
                    {article.category}
                    </span>
                </div>

                <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-4 text-white group-hover:text-green-400 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-6 leading-7 flex-1 font-light">
                    {article.summary}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-5 mt-auto">
                    <span className="flex items-center gap-1.5"><Clock size={14} className="text-green-500"/> {article.read_time}</span>
                    <span className="text-white flex items-center gap-1 bg-white/5 px-4 py-2 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-all font-bold">
                        بخوانید <ArrowLeft size={14}/>
                    </span>
                    </div>
                </div>
                </Link>
            ))}
            </div>
        ) : (
            <div className="text-center py-20 glass rounded-[3rem] mb-32 border border-white/5">
                <Layers size={48} className="mx-auto text-gray-600 mb-4 opacity-50"/>
                <p className="text-gray-400 text-lg">مقاله‌ای یافت نشد.</p>
            </div>
        )}

        {/* --- باکس درخواست --- */}
        <div className="relative max-w-4xl mx-auto">
           <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 blur-3xl rounded-full pointer-events-none opacity-40" />
           <div className="relative glass rounded-[3rem] p-8 md:p-16 text-center border border-white/10 overflow-hidden">
             
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

             <h2 className="text-3xl md:text-4xl font-black mb-6 text-white relative z-10">درخواست مقاله</h2>
             <p className="text-gray-300 mb-10 text-base max-w-lg mx-auto leading-8 relative z-10">لینک مقاله را بفرستید تا ما ترجمه کنیم.</p>
             
             <div className="flex flex-col sm:flex-row gap-4 relative z-10">
               <input 
                 type="text" 
                 placeholder="https://medium.com/..." 
                 className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-left dir-ltr focus:border-green-500 outline-none transition-colors text-white placeholder-gray-500" 
                 value={requestUrl} 
                 onChange={(e) => setRequestUrl(e.target.value)} 
               />
               <button 
                 onClick={submitRequest} 
                 disabled={requestStatus !== 'idle'} 
                 className={`px-10 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl ${requestStatus === 'success' ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-green-400 hover:scale-105'}`}
               >
                 {requestStatus === 'loading' ? '...' : requestStatus === 'success' ? <CheckCircle2/> : <><Send size={20}/> ارسال</>}
               </button>
             </div>
           </div>
        </div>

      </main>
    </div>
  );
}