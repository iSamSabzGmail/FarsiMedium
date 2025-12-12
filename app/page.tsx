'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Clock, Sparkles, Filter, Search, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';

interface Article {
  id: string;
  title: string;
  summary: string;
  cover_url: string | null;
  category: string | null;
  author: string | null;
  created_at: string;
  read_time: string | null;
  slug: string | null;
}

const CATEGORIES = ['همه', 'تکنولوژی', 'توسعه فردی', 'هوش مصنوعی', 'استارتاپ', 'برنامه‌نویسی'];

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  
  // استیت‌های فیلتر و جستجو
  const [filter, setFilter] = useState('همه');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // ۱. دریافت کل مقالات از دیتابیس
  useEffect(() => {
    async function fetchArticles() {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });
      
      if (data) {
        setArticles(data as Article[]);
        setFilteredArticles(data as Article[]);
      }
      setLoading(false);
    }
    fetchArticles();
  }, []);

  // ۲. فیلتر کردن هوشمند (ترکیب دسته‌بندی + جستجو)
  useEffect(() => {
    let result = articles;

    // الف) اول فیلتر دسته بندی
    if (filter !== 'همه') {
      result = result.filter(a => a.category === filter);
    }

    // ب) دوم فیلتر متن جستجو
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(term) || 
        a.summary.toLowerCase().includes(term)
      );
    }

    setFilteredArticles(result);
  }, [filter, searchTerm, articles]);

  return (
    <div className="min-h-screen font-vazir relative text-right pb-20 overflow-hidden" dir="rtl">
      
      <Navbar />

      {/* Hero Section */}
      <header className="pt-20 pb-12 px-4 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-blue-300 text-xs font-bold shadow-lg shadow-blue-500/10 hover:bg-white/10 transition-colors cursor-default select-none">
            <Sparkles size={14} className="animate-pulse"/>
            <span>ترجمه اختصاصی و رایگان مقالات پریمیوم</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight drop-shadow-2xl">
            پلی میان شما و <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
              دانش جهانی
            </span>
          </h1>
          
          <p className="text-gray-300/80 max-w-2xl mx-auto text-lg leading-relaxed font-light drop-shadow-md">
            ما دیوارهای پرداخت (Paywall) را کنار می‌زنیم تا شما به جدیدترین مقالات تکنولوژی و توسعه فردی دسترسی داشته باشید.
          </p>
        </motion.div>
      </header>

      {/* --- بخش جدید: نوار جستجو --- */}
      <div className="max-w-xl mx-auto px-6 mb-10 relative z-20">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="جستجو در بین مقالات..." 
            className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl py-4 pr-12 pl-10 text-white focus:outline-none focus:border-blue-500 focus:bg-black/40 transition-all placeholder-gray-500 shadow-xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={20} />
          </div>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map((cat, index) => (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all backdrop-blur-md border ${
                filter === cat 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)]' 
                  : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <main className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode='popLayout'>
              {filteredArticles.length > 0 ? (
                filteredArticles.map((post, index) => (
                  <motion.article
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    key={post.id}
                    className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 flex flex-col h-full"
                  >
                    <div className="aspect-[1.6] overflow-hidden relative">
                      {post.cover_url ? (
                        <img 
                          src={post.cover_url} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-600">بدون تصویر</div>
                      )}
                      
                      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-xl px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-white/10 shadow-lg">
                        {post.category}
                      </div>
                    </div>
                    
                    <div className="p-7 flex flex-col flex-grow">
                      <Link href={`/blog/${post.slug || post.id}`} className="block mb-3">
                        <h3 className="text-xl font-bold text-gray-100 leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>
                      
                      <p className="text-gray-400/80 text-sm line-clamp-3 mb-6 leading-relaxed flex-grow">
                        {post.summary}
                      </p>
                      
                      <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between text-xs text-gray-500 font-medium">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[10px]">
                              {post.author?.[0] || 'M'}
                           </div>
                           <span className="text-gray-400">{post.author}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                          <Clock size={12} className="text-blue-400" />
                          <span>{post.read_time}</span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
                  <div className="bg-white/5 p-6 rounded-full border border-white/5">
                    <Filter size={32} className="opacity-50"/>
                  </div>
                  <p>هیچ مقاله‌ای با این مشخصات یافت نشد.</p>
                  <button onClick={() => {setFilter('همه'); setSearchTerm('');}} className="text-blue-400 text-sm hover:underline">
                    پاک کردن فیلترها
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}