import './globals.css'
import type { Metadata } from 'next'
import { Vazirmatn } from 'next/font/google'

const vazir = Vazirmatn({ subsets: ['arabic', 'latin'] })

export const metadata: Metadata = {
  title: 'مدیوم فارسی',
  description: 'ترجمه برترین مقالات مدیوم',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.className} bg-[#050505] relative min-h-screen overflow-x-hidden`}>
        
        {/* --- پس‌زمینه رنگی (Aurora Light) --- */}
        <div className="fixed inset-0 w-full h-full -z-50 pointer-events-none">
          
          {/* بنفش بالا چپ (ملایم‌تر) */}
          <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-800 opacity-30 blur-[120px] animate-blob"></div>
          
          {/* آبی بالا راست (ملایم‌تر) */}
          <div className="absolute top-[10%] right-[-10%] w-[500px] h-[500px] bg-blue-700 opacity-30 blur-[100px] animate-blob animation-delay-2000"></div>
          
          {/* صورتی پایین (ملایم‌تر) */}
          <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-pink-800 opacity-20 blur-[130px] animate-blob animation-delay-4000"></div>
          
          {/* نویز خیلی ضعیف */}
          <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")'}}></div>
        </div>

        {children}
      </body>
    </html>
  )
}