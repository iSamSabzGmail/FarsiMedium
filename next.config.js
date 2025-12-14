/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // این سایت رو استاتیک میکنه (index.html میسازه)
  
  // 👇👇👇 این خط حیاتیه! اسم مخزن گیت‌هابت رو دقیق بنویس 👇👇👇
  basePath: '/FarsiMedium', 
  
  images: {
    unoptimized: true, // برای نمایش عکس‌ها در گیت‌هاب الزامیه
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;