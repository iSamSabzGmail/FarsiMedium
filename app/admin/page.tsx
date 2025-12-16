// --- START OF FILE app/admin/page.tsx ---

'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
// تغییر مهم: Link را به عنوان LinkIcon ایمپورت کردیم تا با لینک نکست تداخل نکند
import { Lock, FileText, LogOut, Loader2, Save, Trash2, Eye, PenTool, CheckSquare, Square, Type, AlignLeft, Image as ImageIcon, LayoutList, Link as LinkIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'manage'>('editor');
  
  // --- فرم دستی ---
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    content: '',
    category: 'تکنولوژی',
    read_time: '۵ دقیقه',
    cover_url: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
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

  // --- مدیریت مقالات ---
  const toggleSelect = (id: string) => { if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(item => item !== id)); else setSelectedIds([...selectedIds, id]); };
  const toggleSelectAll = () => { if (selectedIds.length === allArticles.length) setSelectedIds([]); else setSelectedIds(allArticles.map(a => a.id)); };
  const deleteSelected = async () => {
    if (!confirm(`حذف ${selectedIds.length} مقاله؟`)) return;
    const { error } = await supabase.from('articles').delete().in('id', selectedIds);
    if (!error) { setAllArticles(allArticles.filter(a => !selectedIds.includes(a.id))); setSelectedIds([]); alert('🗑️ پاک شدند!'); }
  };

  // --- ذخیره مقاله ---
  const handleSave = async () => {
    if (!formData.title || !formData.content) {
        alert('لطفاً حداقل عنوان و متن مقاله را وارد کنید.');
        return;
    }

    setIsSaving(true);
    try {
        let finalSlug = formData.slug.trim();
        if (!finalSlug) {
            finalSlug = formData.title.replace(/\s+/g, '-').toLowerCase();
        }
        // افزودن عدد تصادفی برای یکتا بودن
        finalSlug += '-' + Math.floor(Math.random() * 1000);

        const { error } = await supabase.from('articles').insert([{
            title: formData.title,
            slug: finalSlug,
            summary: formData.summary,
            content: formData.content,
            category: formData.category,
            read_time: formData.read_time,
            cover_url: formData.cover_url || null,
            published: true,
            source_url: 'Manual Editor'
        }]);

        if (error) throw error;

        alert('✅ مقاله با موفقیت ذخیره شد!');
        
        setFormData({
            title: '',
            slug: '',
            summary: '',
            content: '',
            category: 'تکنولوژی',
            read_time: '۵ دقیقه',
            cover_url: ''
        });

    } catch (error: any) {
        alert('❌ خطا در ذخیره: ' + error.message);
    } finally {
        setIsSaving(false);
    }
  };

  const handleChange = (e: any) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
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
            <button onClick={() => setActiveTab('editor')} className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${activeTab === 'editor' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><PenTool size={18}/> نوشتن مقاله</button>
            <button onClick={() => setActiveTab('manage')} className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${activeTab === 'manage' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}><FileText size={18}/> مدیریت مقالات</button>
        </div>

        {activeTab === 'editor' && (
          <div className="animate-in fade-in max-w-4xl mx-auto">
            <div className="bg-[#111] border border-white/10 p-8 rounded-3xl mb-8 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label className="text-sm text-gray-400 flex items-center gap-2"><Type size={16}/> عنوان مقاله</label>
                      <input name="title" value={formData.title} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 focus:border-blue-500 outline-none" placeholder="مثلاً: آینده هوش مصنوعی" />
                  </div>

                  <div className="space-y-2">
                      <label className="text-sm text-gray-400 flex items-center gap-2"><LayoutList size={16}/> دسته‌بندی</label>
                      <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 focus:border-blue-500 outline-none text-gray-300">
                          <option>تکنولوژی</option>
                          <option>برنامه‌نویسی</option>
                          <option>استارتاپ</option>
                          <option>توسعه فردی</option>
                          <option>هوش مصنوعی</option>
                          <option>هک و امنیت</option>
                      </select>
                  </div>
              </div>

              <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center gap-2"><AlignLeft size={16}/> خلاصه کوتاه (۲-۳ خط)</label>
                  <textarea name="summary" value={formData.summary} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 focus:border-blue-500 outline-none h-24 resize-none" placeholder="خلاصه برای نمایش در لیست..." />
              </div>

              <div className="space-y-2">
                  <label className="text-sm text-gray-400 flex items-center gap-2"><FileText size={16}/> متن اصلی مقاله (مارک‌داون)</label>
                  <div className="relative">
                    <textarea name="content" value={formData.content} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 focus:border-blue-500 outline-none min-h-[400px] font-mono text-sm leading-relaxed" placeholder="# تیتر اصلی&#10;&#10;متن پاراگراف اول...&#10;&#10;## تیتر دوم&#10;- مورد یک" />
                    <div className="absolute top-2 left-2 text-[10px] text-gray-600 bg-black/50 px-2 py-1 rounded">Markdown Supported</div>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label className="text-sm text-gray-400 flex items-center gap-2"><ImageIcon size={16}/> لینک عکس کاور</label>
                      <input name="cover_url" value={formData.cover_url} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 focus:border-blue-500 outline-none dir-ltr text-left" placeholder="https://..." />
                  </div>

                  <div className="space-y-2">
                      {/* اینجا از LinkIcon استفاده شده تا ارور برطرف شود */}
                      <label className="text-sm text-gray-400 flex items-center gap-2"><LinkIcon size={16} className="rotate-45"/> لینک (Slug) - اختیاری</label>
                      <input name="slug" value={formData.slug} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 focus:border-blue-500 outline-none dir-ltr text-left" placeholder="my-article-link" />
                  </div>
              </div>

              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-900/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-all"
              >
                {isSaving ? <><Loader2 className="animate-spin"/> در حال ذخیره...</> : <><Save/> انتشار مقاله</>}
              </button>
            </div>
          </div>
        )}

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