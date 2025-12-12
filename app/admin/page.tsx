'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Lock, Wand2, Users, Copy, Check, Layers, Trash2, FileText, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'create' | 'requests' | 'manage'>('create');
  
  const [requests, setRequests] = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>([]); // برای مدیریت مقالات

  const checkPassword = () => { if (password === 'sam123') setIsAuthenticated(true); else alert('رمز اشتباه!'); };

  // دریافت اطلاعات بر اساس تب فعال
  useEffect(() => {
    if (!isAuthenticated) return;
    
    if (activeTab === 'requests') {
      supabase.from('requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }).then(({ data }) => setRequests(data || []));
    }
    
    // دریافت همه مقالات برای مدیریت
    if (activeTab === 'manage') {
      supabase.from('articles').select('id, title, created_at, category').order('created_at', { ascending: false }).then(({ data }) => setAllArticles(data || []));
    }
  }, [isAuthenticated, activeTab]);

  const [jsonInput, setJsonInput] = useState('');
  const [formData, setFormData] = useState({ title: '', slug: '', summary: '', content: '', author: 'تیم مدیوم فارسی', category: 'تکنولوژی', read_time: '۵ دقیقه', cover_url: '', source_url: '' });

  // ایمپورت JSON (همان قبلی)
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

  // انتشار تکی
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = formData.slug || formData.title.replace(/\s+/g, '-').toLowerCase();
    let finalContent = formData.content; if (formData.source_url) finalContent += `\n\n---\nمنبع: [لینک اصلی](${formData.source_url})`;
    await supabase.from('articles').insert([{ ...formData, slug: finalSlug, content: finalContent, published: true }]);
    alert('✅ منتشر شد!'); 
    setFormData({ title: '', slug: '', summary: '', content: '', author: 'تیم مدیوم فارسی', category: 'تکنولوژی', read_time: '۵ دقیقه', cover_url: '', source_url: '' });
  };

  const markAsDone = async (id: string) => { await supabase.from('requests').update({ status: 'done' }).eq('id', id); setRequests(requests.filter(r => r.id !== id)); };

  // حذف مقاله
  const deleteArticle = async (id: string) => {
    if (!confirm('آیا مطمئنی میخوای این مقاله رو پاک کنی؟ قابل برگشت نیست!')) return;
    await supabase.from('articles').delete().eq('id', id);
    setAllArticles(allArticles.filter(a => a.id !== id));
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center p-4 font-vazir" dir="rtl">
        <div className="bg-[#111] p-8 rounded-3xl border border-white/10 text-center space-y-4 max-w-sm w-full">
            <h2 className="text-white">ورود مدیر</h2>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full bg-white/5 p-3 rounded-xl text-white text-center border border-white/10 outline-none"/>
            <button onClick={checkPassword} className="w-full bg-blue-600 p-3 rounded-xl text-white font-bold">ورود</button>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen text-white p-6 font-vazir" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* نوار ابزار اصلی */}
        <div className="flex justify-between items-center mb-8 bg-[#111] border border-white/10 p-2 rounded-2xl sticky top-4 z-50 shadow-2xl">
          <div className="flex gap-1">
            <button onClick={() => setActiveTab('create')} className={`px-4 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 ${activeTab === 'create' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
               <Layers size={16}/> افزودن محتوا
            </button>
            <button onClick={() => setActiveTab('manage')} className={`px-4 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 ${activeTab === 'manage' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
               <FileText size={16}/> مدیریت مقالات
            </button>
            <button onClick={() => setActiveTab('requests')} className={`px-4 py-2.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 ${activeTab === 'requests' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
               <Users size={16}/> درخواست‌ها {requests.length > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{requests.length}</span>}
            </button>
          </div>
          <Link href="/" className="bg-white/5 p-2.5 rounded-xl hover:bg-white/10 transition-colors mr-2"><ArrowLeft size={20}/></Link>
        </div>

        {/* --- تب مدیریت مقالات (جدید) --- */}
        {activeTab === 'manage' && (
          <div className="space-y-2 animate-in fade-in">
             <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-4 text-blue-300 text-sm">
                لیست تمام مقالات سایت. از اینجا می‌توانید مقالات را حذف کنید.
             </div>
             {allArticles.map(article => (
               <div key={article.id} className="bg-[#111] border border-white/5 p-4 rounded-xl flex items-center justify-between group hover:border-white/10 transition-colors">
                  <div>
                    <h3 className="font-bold text-gray-200">{article.title}</h3>
                    <div className="flex gap-3 text-xs text-gray-500 mt-1">
                      <span>{new Date(article.created_at).toLocaleDateString('fa-IR')}</span>
                      <span className="bg-white/5 px-2 rounded">{article.category}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/blog/${article.id}`} target="_blank" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-blue-400" title="مشاهده"><Eye size={18}/></Link>
                    <button onClick={() => deleteArticle(article.id)} className="p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 text-red-500" title="حذف"><Trash2 size={18}/></button>
                  </div>
               </div>
             ))}
          </div>
        )}

        {/* تب درخواست‌ها */}
        {activeTab === 'requests' && (
          <div className="space-y-4 animate-in fade-in">
            {requests.length === 0 ? <p className="text-gray-500 text-center py-10">صف خالی است.</p> : requests.map(req => (
              <div key={req.id} className="bg-[#111] border border-white/10 p-4 rounded-xl flex items-center justify-between">
                <p className="text-blue-400 text-sm truncate w-96 dir-ltr text-left font-mono">{req.url}</p>
                <div className="flex gap-2"><button onClick={() => navigator.clipboard.writeText(req.url)} className="p-2 bg-white/5 rounded-lg"><Copy size={18}/></button><button onClick={() => markAsDone(req.id)} className="p-2 bg-green-500/20 text-green-500 rounded-lg"><Check size={18}/></button></div>
              </div>
            ))}
          </div>
        )}

        {/* تب افزودن */}
        {activeTab === 'create' && (
          <div className="animate-in fade-in">
            <div className="bg-gradient-to-r from-blue-900/10 to-purple-900/10 border border-blue-500/20 p-6 rounded-2xl mb-8">
              <div className="flex items-center gap-2 mb-4 text-blue-300"><Wand2 size={20} /><h3 className="font-bold">ایمپورت انبوه (JSON)</h3></div>
              <div className="flex gap-2"><textarea placeholder="کد JSON..." className="flex-grow bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-gray-300 font-mono h-20" value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} /><button onClick={handleMagicImport} className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-xl font-bold text-sm h-20">اجرا ✨</button></div>
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