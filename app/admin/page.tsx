'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Lock, Wand2, Users, Copy, Check, Layers, Trash2, FileText, Eye, LogOut, Square, CheckSquare } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar'; // نوبار اصلی سایت

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'requests' | 'manage'>('create');
  
  // داده‌ها
  const [requests, setRequests] = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  
  // انتخاب گروهی
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // --- سیستم لاگین هوشمند ---
  useEffect(() => {
    // چک کردن اینکه آیا قبلا لاگین کرده؟
    const isLoggedIn = localStorage.getItem('medium_admin_auth');
    if (isLoggedIn === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const checkPassword = () => {
    if (password === 'sam123') { // رمز عبور
      setIsAuthenticated(true);
      localStorage.setItem('medium_admin_auth', 'true'); // ذخیره لاگین
    } else {
      alert('رمز اشتباه است!');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('medium_admin_auth');
    setPassword('');
  };

  // --- دریافت داده‌ها ---
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

  // --- لاجیک انتخاب گروهی ---
  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === allArticles.length) {
      setSelectedIds([]); // همه رو بردار
    } else {
      setSelectedIds(allArticles.map(a => a.id)); // همه رو انتخاب کن
    }
  };

  const deleteSelected = async () => {
    if (!confirm(`آیا مطمئنی میخوای ${selectedIds.length} مقاله رو حذف کنی؟`)) return;
    
    const { error } = await supabase.from('articles').delete().in('id', selectedIds);
    if (!error) {
      setAllArticles(allArticles.filter(a => !selectedIds.includes(a.id)));
      setSelectedIds([]);
      alert('🗑️ پاک شدند!');
    }
  };

  // --- لاجیک فرم (مثل قبل) ---
  const [jsonInput, setJsonInput] = useState('');
  const [formData, setFormData] = useState({ title: '', slug: '', summary: '', content: '', author: 'تیم مدیوم فارسی', category: 'تکنولوژی', read_time: '۵ دقیقه', cover_url: '', source_url: '' });

  const handleMagicImport = async () => {
    try {
      if (!jsonInput) return;
      const data = JSON.parse(jsonInput);
      if (Array.isArray(data)) {
        if (!confirm(`وارد کردن ${data.length} مقاله؟`)) return;
        for (const item of data) {
           const finalSlug = item.slug || item.title.replace(/\s+/g, '-').toLowerCase();
           let finalContent = item.content; if (item.source_url) finalContent += `\n\n---\nمنبع: [لینک اصلی](${item.source_url})`;
           await supabase.from('articles').insert([{ ...item, slug: finalSlug, content: finalContent, published: true }]);
        }
        alert('✅ انجام شد!'); setJsonInput('');
      } else {
        setFormData({ ...formData, ...data }); alert('✨ نشست!'); setJsonInput('');
      }
    } catch (e) { alert('❌ فرمت JSON غلط است'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = formData.slug || formData.title.replace(/\s+/g, '-').toLowerCase();
    let finalContent = formData.content; if (formData.source_url) finalContent += `\n\n---\nمنبع: [لینک اصلی](${formData.source_url})`;
    await supabase.from('articles').insert([{ ...formData, slug: finalSlug, content: finalContent, published: true }]);
    alert('✅ منتشر شد!'); 
    setFormData({ title: '', slug: '', summary: '', content: '', author: 'تیم مدیوم فارسی', category: 'تکنولوژی', read_time: '۵ دقیقه', cover_url: '', source_url: '' });
  };

  const markAsDone = async (id: string) => { await supabase.from('requests').update({ status: 'done' }).eq('id', id); setRequests(requests.filter(r => r.id !== id)); };

  // --- صفحه لاگین ---
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
      
      {/* نوبار اصلی سایت برای برگشت راحت */}
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 mt-10">
        
        {/* هدر و دکمه خروج */}
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-white">
                داشبورد مدیریت
            </h1>
            <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 bg-red-500/10 px-4 py-2 rounded-xl transition-colors text-sm font-bold">
                <LogOut size={16}/> خروج
            </button>
        </div>

        {/* نوار ابزار تب‌ها */}
        <div className="flex flex-wrap gap-4 mb-8 bg-[#111]/80 backdrop-blur-md p-2 rounded-2xl border border-white/10 sticky top-24 z-40 shadow-xl">
            <button onClick={() => setActiveTab('create')} className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${activeTab === 'create' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
               <Layers size={18}/> افزودن محتوا
            </button>
            <button onClick={() => setActiveTab('manage')} className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${activeTab === 'manage' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
               <FileText size={18}/> مدیریت مقالات
            </button>
            <button onClick={() => setActiveTab('requests')} className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
               <Users size={18}/> درخواست‌ها {requests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{requests.length}</span>}
            </button>
        </div>

        {/* --- تب مدیریت مقالات (Bulk Actions) --- */}
        {activeTab === 'manage' && (
          <div className="space-y-4 animate-in fade-in">
             
             {/* نوار ابزار انتخاب */}
             <div className="flex justify-between items-center bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl text-sm">
                <div className="flex items-center gap-3">
                    <button onClick={toggleSelectAll} className="flex items-center gap-2 text-blue-300 hover:text-white font-bold transition-colors">
                        {selectedIds.length === allArticles.length && allArticles.length > 0 ? <CheckSquare size={20}/> : <Square size={20}/>}
                        انتخاب همه
                    </button>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-300">{selectedIds.length} مقاله انتخاب شده</span>
                </div>
                {selectedIds.length > 0 && (
                    <button onClick={deleteSelected} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-red-900/20">
                        <Trash2 size={16}/> حذف {selectedIds.length} مورد
                    </button>
                )}
             </div>

             {/* لیست مقالات */}
             <div className="grid gap-3">
                {allArticles.map(article => (
                <div key={article.id} className={`bg-[#111]/80 backdrop-blur-md border p-4 rounded-xl flex items-center justify-between group transition-all ${selectedIds.includes(article.id) ? 'border-blue-500 bg-blue-900/10' : 'border-white/5 hover:border-white/20'}`}>
                    <div className="flex items-center gap-4 overflow-hidden">
                        <button onClick={() => toggleSelect(article.id)} className={`text-gray-500 hover:text-blue-400 transition-colors ${selectedIds.includes(article.id) ? 'text-blue-500' : ''}`}>
                            {selectedIds.includes(article.id) ? <CheckSquare size={24}/> : <Square size={24}/>}
                        </button>
                        <div>
                            <h3 className="font-bold text-gray-200 truncate max-w-md">{article.title}</h3>
                            <div className="flex gap-3 text-xs text-gray-500 mt-1">
                            <span>{new Date(article.created_at).toLocaleDateString('fa-IR')}</span>
                            <span className="bg-white/5 px-2 rounded">{article.category}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/blog/${article.slug || article.id}`} target="_blank" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-blue-400" title="مشاهده"><Eye size={18}/></Link>
                    </div>
                </div>
                ))}
             </div>
          </div>
        )}

        {/* --- تب درخواست‌ها --- */}
        {activeTab === 'requests' && (
          <div className="space-y-4 animate-in fade-in">
            {requests.length === 0 ? <p className="text-gray-500 text-center py-20 bg-white/5 rounded-3xl">صف خالی است.</p> : requests.map(req => (
              <div key={req.id} className="bg-[#111] border border-white/10 p-4 rounded-xl flex items-center justify-between">
                <p className="text-blue-400 text-sm truncate w-96 dir-ltr text-left font-mono">{req.url}</p>
                <div className="flex gap-2"><button onClick={() => navigator.clipboard.writeText(req.url)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10"><Copy size={18}/></button><button onClick={() => markAsDone(req.id)} className="p-2 bg-green-500/20 text-green-500 rounded-lg"><Check size={18}/></button></div>
              </div>
            ))}
          </div>
        )}

        {/* --- تب افزودن مقاله --- */}
        {activeTab === 'create' && (
          <div className="animate-in fade-in">
            <div className="bg-gradient-to-r from-blue-900/10 to-purple-900/10 border border-blue-500/20 p-6 rounded-2xl mb-8">
              <div className="flex items-center gap-2 mb-4 text-blue-300"><Wand2 size={20} /><h3 className="font-bold">ایمپورت انبوه (JSON)</h3></div>
              <div className="flex gap-2"><textarea placeholder="کد JSON را اینجا بگذارید..." className="flex-grow bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-gray-300 font-mono h-20" value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} /><button onClick={handleMagicImport} className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-bold text-sm h-20">اجرا ✨</button></div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 bg-[#111] p-8 rounded-3xl border border-white/5">
                <input type="text" placeholder="عنوان" className="input-field" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required/>
                <textarea placeholder="خلاصه" className="input-field h-24" value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} required></textarea>
                <textarea placeholder="محتوا" className="input-field h-96 leading-8" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required></textarea>
                <div className="grid grid-cols-2 gap-4"><input type="text" placeholder="لینک عکس" className="input-field" value={formData.cover_url} onChange={e => setFormData({...formData, cover_url: e.target.value})} /><input type="text" placeholder="منبع" className="input-field" value={formData.source_url} onChange={e => setFormData({...formData, source_url: e.target.value})} /></div>
                <button type="submit" className="w-full bg-white/10 hover:bg-white/20 py-4 rounded-xl text-white font-bold border border-white/5">انتشار دستی</button>
            </form>
          </div>
        )}
      </div>
      <style jsx>{` .input-field { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; color: white; outline: none; } .input-field:focus { border-color: #3b82f6; background: rgba(0,0,0,0.8); } `}</style>
    </div>
  );
}