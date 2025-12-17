// --- START OF FILE app/page.tsx ---

'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Sparkles, ArrowLeft, BookOpen, Hash, TrendingUp, Clock, AlertCircle, Send, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // برای بخش درخواست مقاله
  const [requestUrl, setRequestUrl] = useState('');
  const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('articles')
      .select('id, title, summary, category, created_at, cover_url, slug, read_time')
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    setArticles(data || []);
    setLoading(false);
  };

  const submitRequest = async () => {
    if (!requestUrl) return;
    setRequestStatus('loading');
    await supabase.from('requests').insert([{ url: requestUrl }]);
    setRequestStatus('success');
    setRequestUrl('');
    setTimeout(() => setRequestStatus('idle'), 3000);
  };

  // فیلتر کردن مقالات بر اساس جستجو
  const filteredArticles = articles.filter(a => a.title.includes(searchQuery));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-vazir selection:bg-green-500/30 selection:text-green-200 overflow-x-hidden" dir="rtl">
      
      {/* --- افکت نوری پس‌زمینه (Glow Effects) --- */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-600/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[300px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* نوبار */}
      <div className="relative z-50">
        <Navbar />
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative z-10">
        
        {/* --- بخش هیرو (Hero Section) --- */}
        <div className="text-center max-w-3xl mx-auto mb-24 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-green-400 text-sm font-bold backdrop-blur-md mb-4"
          >
            <Sparkles size={16} />
            <span>بهترین مقالات تکنولوژی جهان به زبان فارسی</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tighter leading-tight"
          >
            جهانِ دانش <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 drop-shadow-[0_0_30px_rgba(34,197,94,0.4)]">بدون مرز زبانی</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl leading-relaxed"
          >
            ما بهترین مقالات مدیوم (Medium) را با کمک هوش مصنوعی ترجمه و بازنویسی می‌کنیم تا شما همیشه به‌روز باشید.
          </motion.p>

          {/* سرچ بار */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="relative max-w-xl mx-auto group"
          >
            <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-[#111] border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-green-500/50 transition-all">
              <Search className="mr-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="جستجو در مقالات..." 
                className="w-full bg-transparent border-none outline-none text-white placeholder-gray-500 py-3 px-2 font-bold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>

        {/* --- لیست مقالات (Grid) --- */}
        <div className="mb-32">
          <div className="flex items-center justify-between mb-8">
             <h2 className="text-2xl font-bold flex items-center gap-3"><TrendingUp className="text-green-500"/> آخرین مقالات</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-[#111] border border-white/5 rounded-3xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={article.id} 
                >
                  <Link href={`/article?id=${article.slug || article.id}`} className="group relative block bg-[#111] border border-white/10 rounded-[2rem] overflow-hidden hover:border-green-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)] h-full flex flex-col">
                    
                    {/* تصویر مقاله */}
                    <div className="aspect-[16/10] relative overflow-hidden">
                      <img 
                        src={article.cover_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"} 
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent opacity-80" />
                      
                      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1">
                        <Hash size={12} className="text-green-400"/> {article.category}
                      </div>
                    </div>

                    {/* محتوا */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold leading-snug mb-3 group-hover:text-green-400 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed mb-6 flex-1">
                        {article.summary}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs font-bold text-gray-500 border-t border-white/5 pt-4 mt-auto">
                        <div className="flex items-center gap-3">
                           <span className="flex items-center gap-1"><Clock size={14}/> {article.read_time}</span>
                           <span>{new Date(article.created_at).toLocaleDateString('fa-IR')}</span>
                        </div>
                        <span className="flex items-center gap-1 text-green-500 group-hover:translate-x-1 transition-transform">
                          مطالعه <ArrowLeft size={16}/>
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* --- بخش درخواست مقاله (Request Box) --- */}
        <div className="relative max-w-4xl mx-auto">
           {/* افکت نوری پشت باکس */}
           <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20 blur-3xl rounded-full opacity-50 pointer-events-none" />
           
           <div className="relative bg-[#111]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />
              
              <h2 className="text-3xl md:text-4xl font-black mb-4">مقاله‌ای در نظر دارید؟</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">لینک مقاله مدیوم مورد نظرتان را وارد کنید. ربات‌های ما آن را بررسی، ترجمه و به لیست اضافه می‌کنند.</p>
              
              <div className="flex flex-col md:flex-row gap-3 max-w-lg mx-auto">
                <input 
                  type="url" 
                  placeholder="https://medium.com/@username/..." 
                  className="flex-1 bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-left dir-ltr focus:outline-none focus:border-green-500 transition-colors text-white placeholder-gray-600"
                  value={requestUrl}
                  onChange={(e) => setRequestUrl(e.target.value)}
                />
                <button 
                  onClick={submitRequest}
                  disabled={requestStatus !== 'idle'}
                  className={`px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                    requestStatus === 'success' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white text-black hover:bg-green-400 hover:text-black hover:shadow-[0_0_20px_rgba(74,222,128,0.5)]'
                  }`}
                >
                  {requestStatus === 'loading' ? <Loader2 className="animate-spin"/> : 
                   requestStatus === 'success' ? <><CheckCircle2/> ثبت شد</> : 
                   <><Send size={18}/> ارسال</>}
                </button>
              </div>
           </div>
        </div>

      </main>

      {/* فوتر ساده */}
      <footer className="text-center py-10 text-gray-600 text-sm relative z-10">
        <p>© 2024 FarsiMedium - قدرت گرفته از هوش مصنوعی</p>
      </footer>

    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
}