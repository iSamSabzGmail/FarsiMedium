// --- START OF FILE app/admin/page.tsx ---

'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ArrowLeft, Lock, Wand2, Users, FileText, LogOut, Square, CheckSquare, Loader2, Link as LinkIcon, Check, Layers, Trash2, Eye, Edit3 } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'requests' | 'manage'>('create');
  
  const [requests, setRequests] = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('medium_admin_auth');
    if (isLoggedIn === 'true') setIsAuthenticated(true);
  }, []);

  const checkPassword = () => {
    if (password === 'sam123') {
      setIsAuthenticated(true);
      localStorage.setItem('medium_admin_auth', 'true');
    } else { alert('رمز اشتباه است!'); }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('medium_admin_auth');
    setPassword('');
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'requests') {
      supabase.from('requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }).then(({ data }) => setRequests(data || []));
    }
    if (activeTab === 'manage') fetchArticles();
  }, [isAuthenticated, activeTab]);

  const fetchArticles = async () => {
    const { data } = await supabase.from('articles').select('id, title, created_at, category, slug').order('created_at', { ascending: false });
    setAllArticles(data || []);
  };

  const toggleSelect = (id: string) => { if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(item => item !== id)); else setSelectedIds([...selectedIds, id]); };
  const toggleSelectAll = () => { if (selectedIds.length === allArticles.length) setSelectedIds([]); else setSelectedIds(allArticles.map(a => a.id)); };
  const deleteSelected = async () => {
    if (!confirm(`حذف ${selectedIds.length} مقاله؟`)) return;
    const { error } = await supabase.from('articles').delete().in('id', selectedIds);
    if (!error) { setAllArticles(allArticles.filter(a => !selectedIds.includes(a.id))); setSelectedIds([]); alert('🗑️ پاک شدند!'); }
  };

  // --- ربات نویسنده هوشمند ---
  const [autoUrl, setAutoUrl] = useState('');
  const [manualText, setManualText] = useState('');
  const [isManual, setIsManual] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processLog, setProcessLog] = useState('');

  const handleAutoProcess = async () => {
    if (!isManual && !autoUrl.length) { alert('لینک را وارد کنید'); return; }
    if (isManual && !manualText.length) { alert('متن مقاله را پیست کنید'); return; }
    
    setIsProcessing(true);
    let articleText = manualText;

    try {
      // ۱. مرحله استخراج (فقط اگر حالت خودکار باشد)
      if (!isManual) {
        setProcessLog('⏳ در حال استخراج محتوا از Medium...');
        const jinaUrl = `https://r.jina.ai/${autoUrl}`;
        const jinaKey = process.env.NEXT_PUBLIC_JINA_API_KEY;

        // استفاده از پروکسی AllOrigins برای دور زدن CORS در گیت‌هاب پیجز
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(jinaUrl)}`;
        
        const response = await fetch(proxyUrl, {
            headers: jinaKey ? { 'Authorization': `Bearer ${jinaKey}` } : {}
        });

        if (!response.ok) throw new Error('سرویس استخراج پاسخ نداد. متن را به صورت دستی پیست کنید.');
        
        articleText = await response.text();
        if (articleText.length < 300) throw new Error('محتوای استخراج شده ناقص است. متن را دستی کپی کنید.');
      }

      // ۲. مرحله ترجمه و پردازش با هوش مصنوعی
      setProcessLog('🤖 در حال ترجمه و بازنویسی با Gemini...');
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if(!apiKey) throw new Error('کلید Gemini (در تنظیمات) یافت نشد.');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are a Persian tech blogger. Rewrite this article into a high-quality Persian post.
        - Language: Fluent Persian (Modern).
        - Format: Markdown (use # and ##).
        - Output: ONLY a valid JSON object.
        
        JSON Fields:
        - title: Persian title.
        - slug: English kebab-case slug.
        - summary: 2-3 lines summary.
        - content: Full article body in Markdown.
        - category: One of [تکنولوژی, هوش مصنوعی, برنامه‌نویسی, استارتاپ].
        - read_time: e.g. "۷ دقیقه".
        - cover_url: A high-quality Unsplash image URL related to the topic.
        - source_url: "${autoUrl || 'Manual'}"

        Article Content:
        ${articleText.substring(0, 25000)}
      `;

      const aiResult = await model.generateContent(prompt);
      const aiResponse = aiResult.response.text();
      const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let articleData;
      try {
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        articleData = JSON.parse(jsonMatch ? jsonMatch[0] : cleanJson);
      } catch (e) { throw new Error('خطا در تحلیل پاسخ هوش مصنوعی.'); }

      // ۳. ذخیره در دیتابیس
      setProcessLog('💾 در حال انتشار مقاله...');
      const finalSlug = articleData.slug || `post-${Date.now()}`;
      
      const { error } = await supabase.from('articles').insert([{
        ...articleData,
        slug: finalSlug,
        published: true
      }]);

      if (error) throw error;

      alert('✅ مقاله با موفقیت منتشر شد!');
      setAutoUrl('');
      setManualText('');
      
    } catch (error: any) {
      console.error(error);
      alert('❌ خطا: ' + (error.message || 'مشکل در فرآیند'));
    } finally {
      setIsProcessing(false);
      setProcessLog('');
    }
  };

  const markAsDone = async (id: string) => { 
    await supabase.from('requests').update({ status: 'done' }).eq('id', id); 
    setRequests(requests.filter(r => r.id !== id)); 
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center p-4 font-vazir" dir="rtl">
        <div className="bg-[#111]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 text-center space-y-4 max-w-sm w-full shadow-2xl">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto text-blue-500 mb-4"><Lock/></div>
            <h2 className="text-white font-bold text-xl">پنل مدیریت</h2>
            <input type="password" placeholder="رمز عبور" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-black/50 p-3 rounded-xl text-white text-center border border-white/20 outline-none focus:border-blue-500"/>
            <button onClick={checkPassword} className="w-full bg-blue-600 p-3 rounded-xl text-white font-bold hover:bg-blue-500 transition-colors">ورود</button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen text-white font-vazir pb-20" dir="rtl">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 mt-10">
        
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-white">داشبورد مدیریت</h1>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 bg-red-500/10 px-4 py-2 rounded-xl transition-colors text-sm font-bold"><LogOut size={16}/> خروج</button>
        </div>

        <div className="flex flex-wrap gap-4 mb-8 bg-[#111]/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 sticky top-24 z-40 shadow-xl">
            <button onClick={() => setActiveTab('create')} className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}><Layers size={18}/> ربات نویسنده</button>
            <button onClick={() => setActiveTab('manage')} className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${activeTab === 'manage' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}><FileText size={18}/> مقالات</button>
            <button onClick={() => setActiveTab('requests')} className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-white/5'}`}><Users size={18}/> درخواست‌ها</button>
        </div>

        {activeTab === 'create' && (
          <div className="animate-in fade-in max-w-2xl mx-auto">
            <div className="bg-[#111] border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="flex justify-center gap-4 mb-8">
                <button onClick={() => setIsManual(false)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isManual ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500'}`}>لینک مدیوم (خودکار)</button>
                <button onClick={() => setIsManual(true)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isManual ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500'}`}>کپی متن (دستی)</button>
              </div>

              {!isManual ? (
                <div className="space-y-4">
                  <div className="relative">
                    <input type="url" placeholder="https://medium.com/..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white text-left dir-ltr focus:border-blue-500 outline-none" value={autoUrl} onChange={(e) => setAutoUrl(e.target.value)} disabled={isProcessing} />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"><LinkIcon size={20}/></div>
                  </div>
                </div>
              ) : (
                <textarea placeholder="متن انگلیسی مقاله را اینجا پیست کنید..." className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white min-h-[200px] focus:border-blue-500 outline-none mb-4" value={manualText} onChange={(e) => setManualText(e.target.value)} disabled={isProcessing}></textarea>
              )}

              <button onClick={handleAutoProcess} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all mt-4">
                {isProcessing ? (<><Loader2 className="animate-spin"/> {processLog}</>) : (<>شروع ترجمه <ArrowLeft/></>)}
              </button>
              
              {!isManual && <p className="text-[10px] text-gray-600 mt-4 text-center">نکته: اگر خطای دانلود گرفتید، متن مقاله را کپی کرده و از حالت "دستی" استفاده کنید.</p>}
            </div>
          </div>
        )}

        {/* بخش مدیریت مقالات */}
        {activeTab === 'manage' && (
          <div className="space-y-4 animate-in fade-in">
             <div className="flex justify-between items-center bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl text-sm">
                <button onClick={toggleSelectAll} className="flex items-center gap-2 text-blue-300 font-bold">{selectedIds.length === allArticles.length ? <CheckSquare size={20}/> : <Square size={20}/>} انتخاب همه</button>
                {selectedIds.length > 0 && (<button onClick={deleteSelected} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-bold"><Trash2 size={16}/> حذف</button>)}
             </div>
             <div className="grid gap-3">
                {allArticles.map(article => (
                <div key={article.id} className={`bg-[#111] border p-4 rounded-xl flex items-center justify-between transition-all ${selectedIds.includes(article.id) ? 'border-blue-500' : 'border-white/5'}`}>
                    <div className="flex items-center gap-4">
                      <button onClick={() => toggleSelect(article.id)}>{selectedIds.includes(article.id) ? <CheckSquare className="text-blue-500"/> : <Square className="text-gray-600"/>}</button>
                      <div><h3 className="font-bold text-gray-200 truncate max-w-md">{article.title}</h3><span className="text-xs text-gray-500">{article.category}</span></div>
                    </div>
                    <Link href={`/article?id=${article.slug || article.id}`} target="_blank" className="p-2 bg-white/5 rounded-lg text-blue-400"><Eye size={18}/></Link>
                </div>
                ))}
             </div>
          </div>
        )}

        {/* بخش درخواست‌ها */}
        {activeTab === 'requests' && (
          <div className="space-y-4 animate-in fade-in">
            {requests.length === 0 ? <p className="text-gray-500 text-center py-20 bg-white/5 rounded-3xl">صف خالی است.</p> : requests.map(req => (
              <div key={req.id} className="bg-[#111] border border-white/10 p-4 rounded-xl flex items-center justify-between">
                <p className="text-blue-400 text-sm truncate w-96 dir-ltr text-left font-mono">{req.url}</p>
                <div className="flex gap-2">
                  <button onClick={() => { setAutoUrl(req.url); setActiveTab('create'); setIsManual(false); }} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold">ترجمه</button>
                  <button onClick={() => markAsDone(req.id)} className="p-2 bg-green-500/20 text-green-500 rounded-lg"><Check size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}