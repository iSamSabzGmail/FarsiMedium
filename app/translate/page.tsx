'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, ArrowLeft, CheckCircle, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function TranslatePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null); // null, 'found', 'requested'

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.includes('medium.com')) {
      alert('لطفا لینک معتبر Medium وارد کنید');
      return;
    }
    setLoading(true);
    setResult(null);

    // ۱. چک کردن اینکه آیا مقاله قبلاً ترجمه شده؟ (از جدول articles)
    const { data: existingArticle } = await supabase
      .from('articles')
      .select('*')
      .eq('source_url', url)
      .maybeSingle();

    if (existingArticle) {
      setResult({ type: 'found', data: existingArticle });
      setLoading(false);
      return;
    }

    // ۲. چک کردن اینکه آیا قبلاً درخواست داده شده؟ (از جدول requests)
    const { data: existingRequest } = await supabase
      .from('requests')
      .select('*')
      .eq('url', url)
      .maybeSingle();

    if (existingRequest) {
      setResult({ type: 'requested', msg: 'این مقاله قبلاً در صف ترجمه قرار گرفته است.' });
    } else {
      // ۳. ثبت درخواست جدید
      await supabase.from('requests').insert([{ url }]);
      setResult({ type: 'requested', msg: 'درخواست شما ثبت شد! به زودی ترجمه می‌شود.' });
    }
    setLoading(false);
  };

  return (
    // نکته مهم: اینجا bg-[#050505] حذف شد تا پس‌زمینه رنگی اصلی سایت دیده شود
    <div className="min-h-screen text-white font-vazir" dir="rtl">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        
        <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight drop-shadow-2xl">
          دنبال کدوم <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">مقاله</span> می‌گردی؟
        </h1>
        <p className="text-gray-300 text-lg mb-10 font-light">
          لینک مقاله مدیوم رو وارد کن. اگر ترجمه شده باشه، همین الان میخونیش. <br/>
          اگر نه، رایگان برات ترجمه می‌کنیم.
        </p>

        <form onSubmit={handleCheck} className="relative max-w-xl mx-auto mb-12">
          {/* افکت نوری دور اینپوت */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-30 animate-pulse"></div>
          
          <div className="relative">
            <input 
              type="url" 
              placeholder="https://medium.com/..." 
              className="w-full bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-2xl py-5 pr-6 pl-14 text-white text-left dir-ltr placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-2xl"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="absolute left-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20"
            >
              {loading ? <Loader2 className="animate-spin"/> : <Search />}
            </button>
          </div>
        </form>

        {/* --- نمایش نتیجه --- */}
        {result?.type === 'found' && (
          <div className="bg-[#111]/60 backdrop-blur-md border border-green-500/30 p-6 rounded-3xl animate-in fade-in slide-in-from-bottom-4 shadow-2xl">
            <div className="flex items-center gap-2 text-green-400 mb-4 justify-center font-bold">
              <CheckCircle size={24} />
              <span>پیدا شد! این مقاله قبلاً ترجمه شده:</span>
            </div>
            
            <div className="flex gap-4 items-start bg-black/40 p-4 rounded-2xl border border-white/5 text-right">
              {result.data.cover_url && (
                <img src={result.data.cover_url} className="w-24 h-24 object-cover rounded-xl hidden sm:block border border-white/10"/>
              )}
              <div>
                <h3 className="font-bold text-white text-lg mb-2">{result.data.title}</h3>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4 font-light">{result.data.summary}</p>
                <Link href={`/blog/${result.data.slug || result.data.id}`} className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold text-sm bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-all">
                  مطالعه مقاله <ArrowLeft size={16}/>
                </Link>
              </div>
            </div>
          </div>
        )}

        {result?.type === 'requested' && (
          <div className="bg-blue-600/10 backdrop-blur-md border border-blue-500/30 p-8 rounded-3xl animate-in fade-in zoom-in shadow-[0_0_30px_rgba(37,99,235,0.2)]">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400 border border-blue-500/30">
               <Sparkles size={32} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">درخواست ثبت شد</h3>
            <p className="text-blue-200">{result.msg}</p>
          </div>
        )}

      </div>
    </div>
  );
}