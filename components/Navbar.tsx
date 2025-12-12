'use client';
import { BookOpen, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  return (
    // حذف border-b و تغییر رنگ به گرادینت محو
    <nav className="sticky top-0 z-50 bg-gradient-to-b from-[#050505] to-[#050505]/80 backdrop-blur-md pb-4 pt-4">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between bg-white/5 rounded-2xl border border-white/5 shadow-lg backdrop-blur-xl">
        
        {/* لوگو */}
        <Link href="/" className="flex items-center gap-3 select-none group">
          <div className="bg-white text-black p-1.5 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <BookOpen size={20} strokeWidth={3} />
          </div>
          <span className="text-xl font-black tracking-tighter text-white">
            مدیوم<span className="text-blue-500">فارسی</span>
          </span>
        </Link>

        {/* دکمه‌ها */}
        <div className="flex items-center gap-3">
          <Link 
            href="/translate" 
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-900/20"
          >
            <Sparkles size={14} />
            <span>سفارش ترجمه</span>
          </Link>

          <Link href="/admin" className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">
            مدیریت
          </Link>
        </div>
      </div>
    </nav>
  );
}