'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Lock, Wand2, Users, Copy, Check, Layers, Trash2, FileText, Eye, LogOut, Square, CheckSquare, Loader2, Link as LinkIcon } from 'lucide-react';
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
    } else {
      alert('رمز اشتباه است!');
    }
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
    if (activeTab === 'manage') {
      fetchArticles();
    }
  }, [isAuthenticated, activeTab]);

  const fetchArticles = async () => {
    const { data } = await supabase.from('articles').select('id, title, created_at, category').order('created_at', { ascending: false });
    setAllArticles(data || []);
  };

  const toggleSelect = (id: string) => { if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(item => item !== id)); else setSelectedIds([...selectedIds, id]); };
  const toggleSelectAll = () => { if (selectedIds.length === allArticles.length) setSelectedIds([]); else setSelectedIds(allArticles.map(a => a.id)); };
  const deleteSelected = async () => {
    if (!confirm(`حذف ${selectedIds.length} مقاله؟`)) return;
    const { error } = await supabase.from('articles').delete().in('id', selectedIds);
    if (!error) { setAllArticles(allArticles.filter(a => !selectedIds.includes(a.id))); setSelectedIds([]); alert('🗑️ پاک شدند!'); }
  };

  // --- بخش هوشمند جدید (متصل به سرور) ---
  const [autoUrl, setAutoUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processLog, setProcessLog] = useState('');

  const handleAutoProcess = async () => {
    if (!autoUrl.length) { alert('لینک را وارد کنید'); return; }
    
    setIsProcessing(true);
    setProcessLog('🚀 اتصال به سرور هوشمند...');

    try {
      // ارسال درخواست به API Route خودمان
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: autoUrl })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'خطا در پردازش');
      }

      setProcessLog('✅ دریافت شد! در حال ذخیره...');
      const articleData = await response.json();

      // ذخیره در Supabase
      const finalSlug = articleData.slug || articleData.title.replace(/\s+/g, '-').toLowerCase();
      const { error } = await supabase.from('articles').insert([{
        ...articleData,
        slug: finalSlug,
        published: true
      }]);

      if (error) throw error;

      alert('✅ مقاله با موفقیت منتشر شد!');
      setAutoUrl('');
      setProcessLog('');
      
    } catch (error: any) {
      console.error(error);
      alert('❌ خطا: ' + error.message);
      setProcessLog('');
    } finally {
      setIsProcessing(false);
    }
  };

  const markAsDone = async (id: string) => { await supabase.from('requests').update({ status: 'done' }).eq('id', id); setRequests(requests.filter(r => r.id !== id)); };

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
                  <p className="text-sm text-gray-400">لینک مقاله (Medium) را بدهید تا سرور آن را پردازش کند.</p>
                </div>
              </div>

              <div className="space-y-4">
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

                <button 
                  onClick={handleAutoProcess} 
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
                >
                  {isProcessing ? (
                    <><Loader2 className="animate-spin"/> {processLog}</>
                  ) : (
                    <>شروع پردازش سرور <ArrowLeft/></>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* بقیه تب‌ها (مدیریت و درخواست) مثل قبل ... */}
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