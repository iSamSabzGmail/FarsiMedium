/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // این خط حیاتی است برای گیت‌هاب پیج
  images: {
    unoptimized: true, // عکس‌ها در گیت‌هاب پیج باید اینطور باشند
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;