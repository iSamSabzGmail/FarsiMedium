// --- START OF FILE app/admin/page.tsx ---

'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Lock, FileText, LogOut, Loader2, Save, Trash2, Eye, CheckCircle, Code, PenTool, CheckSquare, Square, Check } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'generator' | 'json_import' | 'manage'>('generator');
  
  // ورودی‌ها
  const [rawText, setRawText] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  
  // وضعیت‌ها
  const [isProcessing, setIsProcessing] = useState(false);
  const [processLog, setProcessLog] = useState('');
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // --- احراز هویت ---
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('medium_admin_auth');
    if (isLoggedIn === 'true') setIsAuthenticated(true);
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

  // --- دریافت لیست مقالات ---
  useEffect(() => {
    if (isAuthenticated && activeTab === 'manage') {
      fetchArticles();
    }
  }, [isAuthenticated, activeTab]);

  const fetchArticles = async () => {
    const { data } = await supabase.from('articles').select('id, title, created_at, category, slug').order('created_at', { ascending: false });
    setAllArticles(data || []);
  };

  // --- مدیریت مقالات (حذف) ---
  const toggleSelect = (id: string) => { if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(item => item !== id)); else setSelectedIds([...selectedIds, id]); };
  const toggleSelectAll = () => { if (selectedIds.length === allArticles.length) setSelectedIds([]); else setSelectedIds(allArticles.map(a => a.id)); };
  const deleteSelected = async () => {
    if (!confirm(`حذف ${selectedIds.length} مقاله؟`)) return;
    const { error } = await supabase.from('articles').delete().in('id', selectedIds);
    if (!error) { setAllArticles(allArticles.filter(a => !selectedIds.includes(a.id))); setSelectedIds([]); alert('🗑️ پاک شدند!'); }
  };

  // ----------------------------------------------------------------
  // روش اول: تولید محتوا از متن (Text -> AI -> Save)
  // ----------------------------------------------------------------
  const handleGenerateFromText = async () => {
    if (rawText.length < 50) { alert('متن وارد شده خیلی کوتاه است!'); return; }
    
    setIsProcessing(true);
    setProcessLog('🤖 در حال ترجمه و بازنویسی با Gemini...');

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if(!apiKey) throw new Error('کلید Gemini پیدا نشد. فایل .env.local را چک کنید.');

      const prompt = `
        You are a professional Persian tech editor.
        Task: Rewrite the provided text into a high-quality Persian blog post.
        
        Rules:
        1. Output ONLY valid JSON. No markdown code blocks.
        2. Language: Fluent Persian (Farsi).
        3. Format: Markdown for content.

        JSON Structure:
        {
          "title": "عنوان جذاب فارسی",
          "slug": "english-slug-kebab-case",
          "summary": "خلاصه ۲ خطی جذاب",
          "content": "# تیتر اصلی\n\nمتن مقاله به صورت مارک‌داون...",
          "category": "تکنولوژی",
          "read_time": "۵ دقیقه",
          "cover_url": "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80"
        }
        (Note: For cover_url, choose a random relevant Unsplash ID if specific one not found)

        Input Text:
        ${rawText.substring(0, 30000)}
      `;

      // درخواست مستقیم به گوگل
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );

      if (!response.ok) throw new Error(`خطای گوگل: ${response.status}`);

      const result = await response.json();
      const aiText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiText) throw new Error('پاسخی دریافت نشد.');

      // تمیزکاری و پارس کردن JSON
      const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      const articleData = JSON.parse(cleanJson);

      await saveToSupabase(articleData);
      
      setRawText('');
      
    } catch (error: any) {
      console.error(error);
      alert('❌ خطا: ' + error.message);
    } finally {
      setIsProcessing(false);
      setProcessLog('');
    }
  };

  // ----------------------------------------------------------------
  // روش دوم: ورود مستقیم JSON (Paste JSON -> Save)
  // ----------------------------------------------------------------
  const handleImportJson = async () => {
    try {
        if (!jsonInput.trim()) return;
        setIsProcessing(true);
        setProcessLog('💾 در حال اعتبارسنجی و ذخیره...');

        let data;
        try {
            data = JSON.parse(jsonInput);
        } catch (e) {
            throw new Error('فرمت JSON اشتباه است. لطفاً چک کنید.');
        }

        await saveToSupabase(data);
        setJsonInput('');

    } catch (error: any) {
        alert('❌ خطا: ' + error.message);
    } finally {
        setIsProcessing(false);
        setProcessLog('');
    }
  };

  // تابع مشترک ذخیره در دیتابیس
  const saveToSupabase = async (data: any) => {
      // اطمینان از یونیک بودن اسلاگ
      const finalSlug = (data.slug || data.title).replace(/\s+/g, '-').toLowerCase() + '-' + Math.floor(Math.random() * 1000);
      
      const { error } = await supabase.from('articles').insert([{
        title: data.title,
        slug: finalSlug,
        summary: data.summary,
        content: data.content,
        category: data.category || 'عمومی',
        read_time: data.read_time || '۳ دقیقه',
        cover_url: data.cover_url,
        published: true,
        source_url: 'Manual Entry'
      }]);

      if (error) throw error;
      alert('✅ مقاله با موفقیت ذخیره شد!');
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

        {/* منوی تب‌ها */}
        <div className="flex flex-wrap gap-4 mb-8 bg-[#111]/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 sticky top-24 z-40 shadow-xl">
            <button onClick={() => setActiveTab('generator')} className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${activeTab === 'generator' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><PenTool size={18}/> تبدیل متن به مقاله</button>
            <button onClick={() => setActiveTab('json_import')} className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${activeTab === 'json_import' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><Code size={18}/> ایمپورت JSON</button>
            <button onClick={() => setActiveTab('manage')} className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${activeTab === 'manage' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><FileText size={18}/> مدیریت مقالات</button>
        </div>

        {/* ۱. تب تبدیل متن به مقاله */}
        {activeTab === 'generator' && (
          <div className="animate-in fade-in max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 p-8 rounded-3xl mb-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6 text-blue-300">
                <div className="p-3 bg-blue-500/20 rounded-xl"><PenTool size={28} /></div>
                <div>
                  <h3 className="font-bold text-xl text-white">تولید محتوا با هوش مصنوعی</h3>
                  <p className="text-sm text-gray-400">متن انگلیسی (یا فارسی خام) را وارد کنید تا به مقاله کامل تبدیل شود.</p>
                </div>
              </div>

              <textarea 
                  placeholder="متن مقاله را اینجا کپی کنید..." 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-left dir-ltr placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all min-h-[250px] mb-4"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  disabled={isProcessing}
              />

              <button 
                onClick={handleGenerateFromText} 
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
              >
                {isProcessing ? <><Loader2 className="animate-spin"/> {processLog}</> : <>✨ تبدیل و انتشار</>}
              </button>
            </div>
          </div>
        )}

        {/* ۲. تب ایمپورت JSON */}
        {activeTab === 'json_import' && (
          <div className="animate-in fade-in max-w-3xl mx-auto">
            <div className="bg-[#111] border border-white/10 p-8 rounded-3xl mb-8">
              <div className="flex items-center gap-3 mb-6 text-green-400">
                <div className="p-3 bg-green-500/20 rounded-xl"><Code size={28} /></div>
                <div>
                  <h3 className="font-bold text-xl text-white">ورود دستی JSON</h3>
                  <p className="text-sm text-gray-400">اگر فایل جیسون آماده دارید، اینجا وارد کنید.</p>
                </div>
              </div>

              <textarea 
                  placeholder='{ "title": "...", "content": "..." }' 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-green-400 font-mono text-xs text-left dir-ltr placeholder-gray-700 focus:outline-none focus:border-green-500 transition-all min-h-[250px] mb-4"
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  disabled={isProcessing}
              />

              <button 
                onClick={handleImportJson} 
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
              >
                {isProcessing ? <><Loader2 className="animate-spin"/> {processLog}</> : <><Save/> ذخیره در دیتابیس</>}
              </button>
            </div>
          </div>
        )}

        {/* ۳. تب مدیریت */}
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

      </div>
    </div>
  );
}