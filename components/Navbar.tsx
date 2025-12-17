'use client';
import Link from 'next/link';
import { Home, BookOpen, Search } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-4 flex justify-center">
      <div className="w-full max-w-7xl glass rounded-2xl px-6 h-16 flex items-center justify-between shadow-2xl shadow-green-900/5 transition-all">
        
        {/* لوگو */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="bg-white text-black p-1.5 rounded-lg group-hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <BookOpen size={20} strokeWidth={3} />
          </div>
          <span className="font-black tracking-tighter text-white text-xl">
            مدیوم<span className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">فارسی</span>
          </span>
        </Link>

        {/* دکمه‌ها */}
        <div className="flex items-center gap-2">
          <Link href="/" className="p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-2">
            <span className="hidden md:inline text-sm font-bold">خانه</span>
            <Home size={20} />
          </Link>
          
          {/* دکمه ادمین مخفی (نقطه کوچک) */}
          <Link href="/admin" className="w-1.5 h-1.5 rounded-full bg-white/10 hover:bg-green-500 transition-colors ml-2"></Link>
        </div>

      </div>
    </nav>
  );
}