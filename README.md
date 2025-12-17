# 🌟 FarsiMedium | مدیوم فارسی

**پلتفرم مدرن انتشار مقالات تکنولوژی با طراحی شیشه‌ای (Glassmorphism)**
A modern, high-performance tech blog platform built with Next.js and Supabase, featuring a stunning dark glassmorphism UI.

![Project Banner](public/banner.png)
*(اگر اسکرین‌شات دارید، آن را در پوشه public بگذارید و نامش را banner.png بگذارید، یا این خط را پاک کنید)*

## ✨ ویژگی‌ها (Features)

این پروژه با الهام از طراحی‌های مدرن (مانند Vanilla App) و با تمرکز بر تجربه کاربری ساخته شده است:

- 🎨 **طراحی نئونی و شیشه‌ای (Glassmorphism):** استفاده از افکت‌های بلور، نورپردازی‌های متحرک و تم رنگی سبز/مشکی.
- 🚀 **تکنولوژی Next.js 14:** استفاده از App Router برای سرعت فوق‌العاده.
- 🗄️ **دیتابیس Supabase:** مدیریت بلادرنگ مقالات و درخواست‌ها.
- 📝 **نمایشگر مارک‌داون:** پشتیبانی کامل از Markdown با قابلیت Syntax Highlighting برای کدها (مناسب برنامه‌نویسان).
- 📱 **کاملاً ریسپانسیو:** نمایش عالی در موبایل، تبلت و دسکتاپ.
- 🔒 **پنل ادمین امن:** سیستم لاگین اختصاصی و مدیریت محتوا.
- ⚡ **ایمپورت سریع JSON:** قابلیت وارد کردن مقالات ترجمه شده به صورت JSON برای سرعت در انتشار.

## 🛠️ تکنولوژی‌های استفاده شده (Tech Stack)

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [Supabase](https://supabase.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Markdown:** `react-markdown` & `rehype-highlight` & `highlight.js`

## 🚀 راهنمای نصب و اجرا (Getting Started)

برای اجرای پروژه روی سیستم خودتان، مراحل زیر را طی کنید:

### ۱. کلون کردن مخزن
```bash
git clone https://github.com/username/medium-farsi.git
cd medium-farsi
۲. نصب پکیج‌ها
code
Bash

download

content_copy

expand_less
npm install
# or
yarn install
۳. تنظیم متغیرهای محیطی
یک فایل به نام .env.local در ریشه پروژه بسازید و مقادیر زیر را از پنل Supabase خود کپی کنید:

code
Env

download

content_copy

expand_less
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
۴. اجرای سرور
code
Bash

download

content_copy

expand_less
npm run dev
حالا پروژه در آدرس http://localhost:3000 در دسترس است.

📸 اسکرین‌شات‌ها (Screenshots)
صفحه اصلی (Home)	صفحه مقاله (Article)
![alt text](https://via.placeholder.com/400x200?text=Home+Page+Screenshot)
![alt text](https://via.placeholder.com/400x200?text=Article+Page+Screenshot)
(شما می‌توانید عکس‌های واقعی پروژه را جایگزین لینک‌های بالا کنید)

📂 ساختار دیتابیس (Supabase Schema)
برای اجرای صحیح، باید دو جدول در Supabase بسازید:

articles:
id (uuid, primary)
title (text)
slug (text)
summary (text)
content (text)
category (text)
read_time (text)
cover_url (text)
created_at (timestamp)
published (boolean)
requests:
id (uuid, primary)
url (text)
status (text) -> default: 'pending'
Developed with ❤️ by [Your Name]

code
Code

download

content_copy

expand_less
---

### 📸 یک پیشنهاد برای جذاب‌تر شدن گیت‌هاب:
۱. از صفحه اصلی سایت و صفحه مقاله (وقتی سرور روشنه) **اسکرین‌شات بگیر**.
۲. عکس‌ها را داخل پوشه `public` پروژه کپی کن (مثلاً با نام `home.png` و `article.png`).
۳. در فایل README بالا، به جای لینک‌های `placeholder`، آدرس عکس‌های خودت را بده (مثلاً: `![Home](public/home.png)`).

این کار باعث می‌شود هر کسی وارد گیت‌هاب تو شود، با دیدن عکس‌های شیشه‌ای و نئونی سایت، جذب پروژه شود. موفق باشی! ✌️
