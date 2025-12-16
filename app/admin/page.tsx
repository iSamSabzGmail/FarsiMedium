// --- START OF FILE app/admin/page.tsx ---

'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Lock, Layers, FileText, Users, LogOut, Loader2, Link as LinkIcon, FileType, CheckSquare, Square, Trash2, Eye, Key, Wand2, Check } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'requests' | 'manage'>('create');
  
  // تنظیمات ورودی
  const [inputType, setInputType] = useState<'link' | 'text'>('link');
  const [manualText, setManualText] = useState('');
  const [jinaKey, setJinaKey] = useState(''); 

  const [requests, setRequests] = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // --- احراز هویت و لود کردن کلید ---
  useEffect(() => {
    // 1. چک کردن لاگین
    const isLoggedIn = localStorage.getItem('medium_admin_auth');
    if (isLoggedIn === 'true') setIsAuthenticated(true);
    
    // 2. تلاش برای پیدا کردن کلید Jina (اولویت با متغیر محیطی، بعد لوکال استوریج)
    const envKey = process.env.NEXT_PUBLIC_JINA_API_KEY;
    const localKey = localStorage.getItem('jina_api_key');
    
    if (envKey) {
        setJinaKey(envKey);
    } else if (localKey) {
        setJinaKey(localKey);
    }
  }, []);

  const checkPassword = () => {
    if (password === 'sam123') {
      setIsAuthenticated(true);
      localStorage.setItem('medium_admin_auth', 'true');
    } else {
      alert('رمز اشتباه است!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('medium_admin_auth');
    setPassword('');
  };

  const saveJinaKey = (val: string) => {
    setJinaKey(val);
    localStorage.setItem('jina_api_key', val);
  };

  // --- دریافت داده‌ها ---
  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === 'manage') fetchArticles();
    if (activeTab === 'requests') fetchRequests();
  }, [isAuthenticated, activeTab]);

  const fetchArticles = async () => {
    const { data } = await supabase.from('articles').select('id, title, created_at, category, slug').order('created_at', { ascending: false });
    setAllArticles(data || []);
  };

  const fetchRequests = async () => {
    const { data } = await supabase.from('requests').select('*').eq('status', 'pending').order('created_at', { ascending: false });
    setRequests(data || []);
  };

  const toggleSelect = (id: string) => { if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(item => item !== id)); else setSelectedIds([...selectedIds, id]); };
  const toggleSelectAll = () => { if (selectedIds.length === allArticles.length) setSelectedIds([]); else setSelectedIds(allArticles.map(a => a.id)); };
  const deleteSelected = async () => {
    if (!confirm(`حذف ${selectedIds.length} مقاله؟`)) return;
    const { error } = await supabase.from('articles').delete().in('id', selectedIds);
    if (!error) { setAllArticles(allArticles.filter(a => !selectedIds.includes(a.id))); setSelectedIds([]); alert('🗑️ پاک شدند!'); }
  };

  // --- ربات نویسنده (Jina Key Integration) ---
  const [autoUrl, setAutoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processLog, setProcessLog] = useState('');

  const handleAutoProcess = async () => {
    if (inputType === 'link' && !autoUrl.length) { alert('لینک را وارد کنید'); return; }
    if (inputType === 'text' && manualText.length < 50) { alert('متن مقاله خیلی کوتاه است'); return; }
    
    setIsProcessing(true);
    setProcessLog('⏳ شروع عملیات...');

    try {
      let articleText = '';

      if (inputType === 'text') {
        articleText = manualText;
        setProcessLog('📝 متن دستی دریافت شد...');
      } else {
        const targetUrl = `https://r.jina.ai/${autoUrl}`;
        setProcessLog('🌐 تماس با سرور Jina...');

        // استراتژی ۱: استفاده از کلید Jina (مستقیم و قدرتمند)
        if (jinaKey && jinaKey.length > 5) {
             setProcessLog('🔑 دانلود با اکانت پرمیوم Jina...');
             try {
                 const res = await fetch(targetUrl, {
                     headers: {
                         'Authorization': `Bearer ${jinaKey}`,
                         'X-Return-Format': 'markdown',
                         'Accept': 'application/json'
                     }
                 });
                 
                 if(res.ok) {
                     // Jina با کلید معمولا JSON برمیگرداند یا Text
                     const contentType = res.headers.get("content-type");
                     if (contentType && contentType.indexOf("application/json") !== -1) {
                        const data = await res.json();
                        articleText = data.data?.content || data.text || JSON.stringify(data);
                     } else {
                        articleText = await res.text();
                     }
                     console.log("Downloaded via Jina Key");
                 } else {
                     console.warn("Jina Direct Failed:", res.status);
                 }
             } catch(e) { console.warn('Jina Key method failed:', e); }
        }

        // استراتژی ۲: اگر کلید نبود یا کار نکرد (پروکسی CodeTabs)
        if (!articleText) {
             setProcessLog('🔄 تلاش با سرور کمکی (بدون کلید)...');
             try {
                 const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`);
                 if (res.ok) {
                     const text = await res.text();
                     if (text.length > 500 && !text.includes('Access Denied')) articleText = text;
                 }
             } catch (e) { console.log('CodeTabs failed'); }
        }

        // استراتژی ۳: AllOrigins
        if (!articleText) {
            try {
                const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);
                if (res.ok) {
                    const text = await res.text();
                    if (text.length > 500) articleText = text;
                }
            } catch (e) {}
        }

        if (!articleText || articleText.includes('Access Denied')) {
          throw new Error('دانلود مقاله شکست خورد. اگر کلید Jina وارد کرده‌اید، مطمئن شوید درست است. در غیر این صورت متن را دستی وارد کنید.');
        }
      }

      setProcessLog('🤖 ارسال به Gemini...');

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if(!apiKey) throw new Error('کلید Gemini پیدا نشد.');

      const prompt = `
        You are a professional Persian tech editor.
        Task: Rewrite this article for a Persian blog.
        Rules: Fluent Persian, Markdown format, JSON Output ONLY.
        
        JSON Structure:
        {
          "title": "Persian Title",
          "slug": "english-slug-unique",
          "summary": "Persian Summary",
          "content": "Markdown Content",
          "category": "Tech/AI/Startup",
          "read_time": "5 min",
          "cover_url": "Valid Image URL or null",
          "source_url": "${inputType === 'link' ? autoUrl : 'Manual Input'}"
        }

        Input Text:
        ${articleText.substring(0, 35000)}
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );

      if (!response.ok) {
        throw new Error(`خطای هوش مصنوعی (${response.status}).`);
      }

      const aiResult = await response.json();
      const aiResponseText = aiResult.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponseText) throw new Error('پاسخ خالی از هوش مصنوعی دریافت شد.');

      const cleanJson = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      let articleData;
      
      try {
        articleData = JSON.parse(cleanJson);
      } catch (e) {
        const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) articleData = JSON.parse(jsonMatch[0]);
        else throw new Error('فرمت پاسخ صحیح نیست.');
      }

      setProcessLog('💾 ذخیره در دیتابیس...');

      const finalSlug = articleData.slug || articleData.title.replace(/\s+/g, '-').toLowerCase();
      
      const { error } = await supabase.from('articles').insert([{
        ...articleData,
        slug: finalSlug + '-' + Math.floor(Math.random() * 10000),
        published: true
      }]);

      if (error) throw error;

      alert('✅ مقاله با موفقیت منتشر شد!');
      if(inputType === 'link') setAutoUrl('');
      setManualText('');
      
    } catch (error: any) {
      console.error(error);
      alert('❌ خطا: ' + (error.message || 'مشکل ناشناخته'));
    } finally {
      setIsProcessing(false);
      setProcessLog('');
    }
  };

  const markAsDone = async (id: string) => { await supabase.from('requests').update({ status: 'done' }).eq('id', id); fetchRequests(); };

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
            <button onClick={() => setActiveTab('create')} className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${activeTab === 'create' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Layers size={18}/> ربات نویسنده</button>
            <button onClick={() => setActiveTab('manage')} className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${activeTab === 'manage' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><FileText size={18}/> مدیریت مقالات</button>
            <button onClick={() => setActiveTab('requests')} className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Users size={18}/> درخواست‌ها {requests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{requests.length}</span>}</button>
        </div>

        {activeTab === 'create' && (
          <div className="animate-in fade-in max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 p-8 rounded-3xl mb-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[60px] -z-10"></div>
              
              <div className="flex items-center gap-3 mb-6 text-blue-300">
                <div className="p-3 bg-blue-500/20 rounded-xl"><Wand2 size={28} /></div>
                <div>
                  <h3 className="font-bold text-xl text-white">تولید محتوای خودکار</h3>
                  <p className="text-sm text-gray-400">لینک یا متن مقاله را وارد کنید</p>
                </div>
              </div>

              {/* انتخاب روش ورودی */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                 <div className="flex bg-black/40 p-1 rounded-xl w-fit">
                    <button onClick={() => setInputType('link')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${inputType === 'link' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}><LinkIcon size={16}/> لینک</button>
                    <button onClick={() => setInputType('text')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${inputType === 'text' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}><FileType size={16}/> متن دستی</button>
                 </div>
                 
                 {/* ورودی کلید Jina - اگر در env باشد خودکار پر میشود */}
                 {inputType === 'link' && (
                     <div className="flex-1 min-w-[200px] relative">
                        <input 
                            type="text" 
                            placeholder="کلید Jina (اگر در تنظیمات نباشد، اینجا وارد کنید)" 
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                            value={jinaKey}
                            onChange={(e) => saveJinaKey(e.target.value)}
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500"><Key size={14}/></div>
                     </div>
                 )}
              </div>

              <div className="space-y-4">
                {inputType === 'link' ? (
                    <div className="relative">
                      <input 
                        type="url" 
                        placeholder="https://medium.com/..." 
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white text-left dir-ltr placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                        value={autoUrl}
                        onChange={(e) => setAutoUrl(e.target.value)}
                        disabled={isProcessing}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"><LinkIcon size={20}/></div>
                    </div>
                ) : (
                    <textarea 
                        placeholder="متن مقاله را اینجا پیست کنید..." 
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-left dir-ltr placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all min-h-[150px]"
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                        disabled={isProcessing}
                    />
                )}

                <button 
                  onClick={handleAutoProcess} 
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
                >
                  {isProcessing ? (
                    <><Loader2 className="animate-spin"/> {processLog}</>
                  ) : (
                    <>شروع پردازش <ArrowLeft/></>
                  )}
                </button>
                
                {inputType === 'link' && !jinaKey && (
                    <p className="text-xs text-yellow-500/80 text-center mt-2">نکته: بدون کلید Jina، ممکن است دانلود برخی مقالات توسط مدیوم مسدود شود.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* لیست مقالات (Manage) */}
        {activeTab === 'manage' && (
          <div className="space-y-4 animate-in fade-in">
             <div className="flex justify-between items-center bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl text-sm">
                <div className="flex items-center gap-3"><button onClick={toggleSelectAll} className="flex items-center gap-2 text-blue-300 hover:text-white font-bold transition-colors">{selectedIds.length === allArticles.length && allArticles.length > 0 ? <CheckSquare size={20}/> : <Square size={20}/>} انتخاب همه</button><span className="text-gray-400">|</span><span className="text-gray-300">{selectedIds.length} مقاله انتخاب شده</span></div>
                {selectedIds.length > 0 && (<button onClick={deleteSelected} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-red-900/20"><Trash2 size={16}/> حذف {selectedIds.length} مورد</button>)}
             </div>
             <div className="grid gap-3">
                {allArticles.map(article => (
                <div key={article.id} className={`bg-[#111]/80 backdrop-blur-md border p-4 rounded-xl flex items-center justify-between group transition-all ${selectedIds.includes(article.id) ? 'border-blue-500 bg-blue-900/10' : 'border-white/5 hover:border-white/20'}`}>
                    <div className="flex items-center gap-4 overflow-hidden"><button onClick={() => toggleSelect(article.id)} className={`text-gray-500 hover:text-blue-400 transition-colors ${selectedIds.includes(article.id) ? 'text-blue-500' : ''}`}>{selectedIds.includes(article.id) ? <CheckSquare size={24}/> : <Square size={24}/>}</button><div><h3 className="font-bold text-gray-200 truncate max-w-md">{article.title}</h3><div className="flex gap-3 text-xs text-gray-500 mt-1"><span>{new Date(article.created_at).toLocaleDateString('fa-IR')}</span><span className="bg-white/5 px-2 rounded">{article.category}</span></div></div></div>
                    <div className="flex gap-2"><Link href={`/article?id=${article.slug || article.id}`} target="_blank" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-blue-400" title="مشاهده"><Eye size={18}/></Link></div>
                </div>
                ))}
             </div>
          </div>
        )}

        {/* درخواست‌ها */}
        {activeTab === 'requests' && (
          <div className="space-y-4 animate-in fade-in">
            {requests.length === 0 ? <p className="text-gray-500 text-center py-20 bg-white/5 rounded-3xl">صف خالی است.</p> : requests.map(req => (
              <div key={req.id} className="bg-[#111] border border-white/10 p-4 rounded-xl flex items-center justify-between">
                <p className="text-blue-400 text-sm truncate w-96 dir-ltr text-left font-mono">{req.url}</p>
                <div className="flex gap-2"><button onClick={() => {navigator.clipboard.writeText(req.url); setAutoUrl(req.url); setActiveTab('create');}} className="px-3 py-1.5 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-colors">ترجمه خودکار</button><button onClick={() => markAsDone(req.id)} className="p-2 bg-green-500/20 text-green-500 rounded-lg"><Check size={18}/></button></div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}