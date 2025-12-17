// --- START OF FILE app/admin/page.tsx ---

'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, FileText, LogOut, Loader2, Save, Trash2, Eye, CheckSquare, Square, Type, AlignLeft, Image as ImageIcon, LayoutList, Link as LinkIcon, Code, ArrowDown, Settings } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'manage'>('editor');
  
  const [jsonInput, setJsonInput] = useState('');
  const [formData, setFormData] = useState({
    title: '', slug: '', summary: '', content: '', category: 'تکنولوژی', read_time: '۵ دقیقه', cover_url: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
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
    if (isAuthenticated && activeTab === 'manage') {
      fetchArticles();
    }
  }, [isAuthenticated, activeTab]);

  const fetchArticles = async () => {
    const { data } = await supabase.from('articles').select('id, title, created_at, category, slug').order('created_at', { ascending: false });
    setAllArticles(data || []);
  };

  const handleParseJson = () => {
    if (!jsonInput.trim()) { alert('JSON خالی است'); return; }
    try {
        const data = JSON.parse(jsonInput);
        setFormData({
            title: data.title || '',
            slug: data.slug || '',
            summary: data.summary || '',
            content: data.content || '',
            category: data.category || 'تکنولوژی',
            read_time: data.read_time || '۵ دقیقه',
            cover_url: data.cover_url || ''
        });
        alert('✅ فرم پر شد!');
        setJsonInput('');
    } catch { alert('❌ فرمت JSON اشتباه است.'); }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) { alert('عنوان و متن الزامی است.'); return; }
    setIsSaving(true);
    try {
        let finalSlug = formData.slug.trim();
        if (!finalSlug) finalSlug = formData.title.replace(/\s+/g, '-').toLowerCase();
        finalSlug += '-' + Math.floor(Math.random() * 1000);

        const { error } = await supabase.from('articles').insert([{
            ...formData,
            slug: finalSlug,
            published: true,
            source_url: 'JSON Import'
        }]);

        if (error) throw error;
        alert('✅ ذخیره شد!');
        setFormData({ title: '', slug: '', summary: '', content: '', category: 'تکنولوژی', read_time: '۵ دقیقه', cover_url: '' });
    } catch (e: any) { alert('خطا: ' + e.message); } finally { setIsSaving(false); }
  };

  const handleChange = (e: any) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSelect = (id: string) => { if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(item => item !== id)); else setSelectedIds([...selectedIds, id]); };
  const toggleSelectAll = () => { if (selectedIds.length === allArticles.length) setSelectedIds([]); else setSelectedIds(allArticles.map(a => a.id)); };
  const deleteSelected = async () => {
    if (!confirm(`حذف ${selectedIds.length} مورد؟`)) return;
    const { error } = await supabase.from('articles').delete().in('id', selectedIds);
    if (!error) { setAllArticles(allArticles.filter(a => !selectedIds.includes(a.id))); setSelectedIds([]); alert('🗑️ پاک شدند!'); }
  };

  // --- صفحه لاگین ---
  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center p-4 font-vazir relative overflow-hidden bg-[#050505]" dir="rtl">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-green-600/20 blur-[150px] rounded-full opacity-60" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full opacity-40" />
        </div>
        
        <div className="glass p-10 rounded-[2.5rem] text-center space-y-8 max-w-md w-full shadow-2xl relative z-10 border border-white/5 backdrop-blur-xl">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-400 mb-6 border border-green-500/20">
                <Lock size={32}/>
            </div>
            <h2 className="text-white font-black text-3xl">ورود مدیریت</h2>
            <input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-white/5 p-4 rounded-2xl text-white text-center border border-white/5 outline-none focus:border-green-500 focus:bg-white/10 transition-all text-lg placeholder-gray-500"/>
            <button onClick={checkPassword} className="w-full bg-green-600 hover:bg-green-500 text-black py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-green-900/40">ورود</button>
        </div>
    </div>
  );

  // --- پنل اصلی ---
  return (
    <div className="min-h-screen text-white font-vazir relative bg-[#050505] selection:bg-green-500/30 selection:text-green-200 overflow-x-hidden" dir="rtl">
      
      {/* نورپردازی پس‌زمینه (دقیقاً مثل صفحه اصلی) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-green-600/15 blur-[130px] rounded-full opacity-60 mix-blend-screen animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[600px] bg-blue-600/10 blur-[150px] rounded-full opacity-40" />
      </div>

      <Navbar />

      {/* 
         اصلاح مهم: استفاده از pt-32 به جای mt-32 
         این باعث می‌شود مشکل "کادر خالی بالا" حل شود 
      */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-32 pb-20 relative z-10">
        
        {/* هدر */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="text-center md:text-right">
                <h1 className="text-4xl font-black text-white drop-shadow-lg mb-2">داشبورد</h1>
                <p className="text-gray-400 text-sm font-light">کنترل کامل بر محتوای وب‌سایت</p>
            </div>
            <button onClick={handleLogout} className="px-6 py-2.5 rounded-2xl text-red-400 hover:text-white hover:bg-red-500/10 transition-all text-sm font-bold flex items-center gap-2 border border-white/5 hover:border-red-500/20">
                <LogOut size={18}/> خروج
            </button>
        </div>

        {/* تب‌ها */}
        <div className="flex justify-center md:justify-start gap-4 mb-12">
            <button 
                onClick={() => setActiveTab('editor')} 
                className={`px-8 py-3 rounded-2xl font-bold transition-all text-sm flex items-center gap-2 border ${
                    activeTab === 'editor' 
                    ? 'bg-green-600 text-black border-green-500 shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)]' 
                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
            >
                <Code size={18}/> ایمپورت
            </button>
            <button 
                onClick={() => setActiveTab('manage')} 
                className={`px-8 py-3 rounded-2xl font-bold transition-all text-sm flex items-center gap-2 border ${
                    activeTab === 'manage' 
                    ? 'bg-green-600 text-black border-green-500 shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)]' 
                    : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                }`}
            >
                <Settings size={18}/> مدیریت
            </button>
        </div>

        {/* محتوا: ادیتور */}
        {activeTab === 'editor' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto space-y-10">
            
            {/* باکس JSON */}
            <div className="glass p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl border border-white/5 group">
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3 text-green-400 font-bold">
                        <Code size={24}/> <h3>JSON ورودی</h3>
                    </div>
                    <button onClick={handleParseJson} className="text-xs font-bold bg-white/5 hover:bg-green-500/20 hover:text-green-400 text-gray-400 px-4 py-2 rounded-xl transition-colors">
                        اعمال <ArrowDown size={14} className="inline"/>
                    </button>
                </div>
                <textarea 
                    value={jsonInput} 
                    onChange={(e) => setJsonInput(e.target.value)} 
                    placeholder='{ "title": "...", "content": "..." }' 
                    className="w-full bg-black/30 border border-white/5 rounded-2xl p-6 text-sm font-mono text-green-300 min-h-[120px] focus:outline-none focus:border-green-500/30 transition-all dir-ltr text-left placeholder-gray-700 leading-relaxed"
                />
            </div>

            {/* فرم اصلی */}
            <div className="glass p-8 md:p-12 rounded-[2.5rem] space-y-8 border border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-xs text-gray-500 font-bold px-1 uppercase tracking-wider">عنوان</label>
                        <input name="title" value={formData.title} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 focus:border-green-500/50 outline-none transition-colors text-white placeholder-gray-700 focus:bg-black/40"/>
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs text-gray-500 font-bold px-1 uppercase tracking-wider">دسته‌بندی</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 focus:border-green-500/50 outline-none text-gray-300 cursor-pointer appearance-none focus:bg-black/40">
                            <option>تکنولوژی</option>
                            <option>هک و امنیت</option>
                            <option>هوش مصنوعی</option>
                            <option>برنامه‌نویسی</option>
                            <option>استارتاپ</option>
                            <option>توسعه فردی</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs text-gray-500 font-bold px-1 uppercase tracking-wider">خلاصه</label>
                    <textarea name="summary" value={formData.summary} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 focus:border-green-500/50 outline-none h-28 resize-none text-white placeholder-gray-700 focus:bg-black/40"/>
                </div>

                <div className="space-y-3">
                    <label className="text-xs text-gray-500 font-bold px-1 uppercase tracking-wider">متن (Markdown)</label>
                    <textarea name="content" value={formData.content} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-2xl p-6 focus:border-green-500/50 outline-none min-h-[400px] font-mono text-sm leading-relaxed text-gray-300 placeholder-gray-700 focus:bg-black/40"/>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-xs text-gray-500 font-bold px-1 uppercase tracking-wider">لینک عکس</label>
                        <input name="cover_url" value={formData.cover_url} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 focus:border-green-500/50 outline-none dir-ltr text-left text-white placeholder-gray-700 focus:bg-black/40"/>
                    </div>
                    <div className="space-y-3">
                        <label className="text-xs text-gray-500 font-bold px-1 uppercase tracking-wider">اسلاگ</label>
                        <input name="slug" value={formData.slug} onChange={handleChange} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 focus:border-green-500/50 outline-none dir-ltr text-left text-white placeholder-gray-700 focus:bg-black/40"/>
                    </div>
                </div>

                <button 
                    onClick={handleSave} 
                    disabled={isSaving} 
                    className="w-full bg-green-600 hover:bg-green-500 text-black py-5 rounded-2xl font-bold text-lg shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01]"
                >
                    {isSaving ? <><Loader2 className="animate-spin"/> در حال انتشار...</> : <><Save/> انتشار نهایی</>}
                </button>
            </div>
          </div>
        )}

        {/* محتوا: مدیریت */}
        {activeTab === 'manage' && (
          <div className="space-y-6 animate-in fade-in max-w-5xl mx-auto">
             <div className="flex justify-between items-center glass p-6 rounded-[2rem] text-sm border border-white/5 shadow-xl">
                <div className="flex items-center gap-4">
                    <button onClick={toggleSelectAll} className="flex items-center gap-2 text-green-400 hover:text-white font-bold transition-colors">
                        {selectedIds.length === allArticles.length && allArticles.length > 0 ? <CheckSquare size={22}/> : <Square size={22}/>} 
                        انتخاب همه
                    </button>
                    <span className="text-gray-600 text-xl">|</span>
                    <span className="text-white font-bold">{selectedIds.length} مقاله</span>
                </div>
                {selectedIds.length > 0 && (
                    <button onClick={deleteSelected} className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-6 py-3 rounded-xl font-bold transition-all border border-red-500/20">
                        <Trash2 size={18}/> حذف
                    </button>
                )}
             </div>

             <div className="grid gap-4">
                {allArticles.map(article => (
                <div key={article.id} className={`bg-[#0a0a0a]/60 backdrop-blur-md p-6 rounded-[2rem] flex items-center justify-between group transition-all border border-white/5 hover:border-green-500/30 ${selectedIds.includes(article.id) ? 'border-green-500/50 bg-green-900/10' : ''}`}>
                    <div className="flex items-center gap-6 overflow-hidden">
                        <button onClick={() => toggleSelect(article.id)} className={`text-gray-600 hover:text-green-400 transition-colors ${selectedIds.includes(article.id) ? 'text-green-500' : ''}`}>
                            {selectedIds.includes(article.id) ? <CheckSquare size={26}/> : <Square size={26}/>}
                        </button>
                        <div>
                            <h3 className="font-bold text-white text-lg truncate max-w-md mb-2">{article.title}</h3>
                            <div className="flex gap-4 text-xs text-gray-400">
                                <span>{new Date(article.created_at).toLocaleDateString('fa-IR')}</span>
                                <span className="bg-white/5 px-3 py-0.5 rounded-full border border-white/5 text-gray-300">{article.category}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link href={`/article?id=${article.slug || article.id}`} target="_blank" className="p-3 bg-white/5 rounded-2xl hover:bg-green-500 hover:text-black text-green-400 transition-all border border-white/5 hover:border-green-500 shadow-lg" title="مشاهده">
                            <Eye size={22}/>
                        </Link>
                    </div>
                </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}