'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Clock, ArrowLeft, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    supabase.from('articles').select('id, title, summary, category, created_at, cover_url, slug, read_time')
      .eq('published', true).order('created_at', { ascending: false })
      .then(({ data }) => setArticles(data || []));
  }, []);

  const filtered = articles.filter(a => a.title.includes(searchQuery));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-vazir relative overflow-hidden" dir="rtl">
      
      {/* نورهای پس‌زمینه خیلی ملایم */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-green-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
        
        {/* هدر */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/5 border border-green-500/10 text-green-400 text-xs font-bold animate-pulse">
            <Sparkles size={12}/> <span>بروزترین مقالات دنیا</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            دنیای تکنولوژی، <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-green-400 to-emerald-700">به زبان مادری</span>
          </h1>
          
          {/* جستجو */}
          <div className="relative max-w-md mx-auto mt-8 group">
            <div className="absolute inset-0 bg-green-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center glass rounded-full px-4 py-2">
              <Search className="text-gray-500 ml-3" size={20}/>
              <input 
                type="text" 
                placeholder="جستجو..." 
                className="bg-transparent border-none outline-none text-white w-full h-10 placeholder-gray-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* لیست مقالات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((article) => (
            <Link key={article.id} href={`/article?id=${article.slug || article.id}`} className="group glass rounded-3xl overflow-hidden hover:-translate-y-1 transition-all duration-500">
              
              <div className="aspect-[16/9] relative overflow-hidden">
                <img src={article.cover_url} alt={article.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
                <span className="absolute top-3 right-3 bg-black/50 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold text-white border border-white/5">
                  {article.category}
                </span>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold mb-3 text-gray-100 group-hover:text-green-400 transition-colors line-clamp-2 leading-relaxed">
                  {article.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-6 leading-7">
                  {article.summary}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                  <span className="flex items-center gap-1"><Clock size={14}/> {article.read_time}</span>
                  <span className="text-green-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                    بخوانید <ArrowLeft size={14}/>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </main>
    </div>
  );
}