'use client';
import Link from 'next/link';
import { Home, BookOpen, Github, Twitter } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="fixed top-6 left-0 right-0 z-50 px-4 flex justify-center">
      <div className="glass rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl shadow-green-900/10">
        
        {/* لوگو */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-white text-black p-1.5 rounded-full group-hover:bg-green-400 transition-colors">
            <BookOpen size={18} strokeWidth={3} />
          </div>
          <span className="font-bold tracking-tighter text-white text-lg">
            مدیوم<span className="text-green-500">فارسی</span>
          </span>
        </Link>

        {/* لینک‌ها */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/" className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
            <Home size={20} />
          </Link>
          <a href="#" className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
            <Github size={20} />
          </a>
        </div>

        {/* دکمه ادمین مخفی (برای دسترسی خودت) */}
        <Link href="/admin" className="w-2 h-2 rounded-full bg-white/5 hover:bg-green-500 transition-colors"></Link>
      </div>
    </nav>
  );
}