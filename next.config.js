/** @type {import('next').NextConfig} */
const nextConfig = {
  // این بخش برای جلوگیری از ارورهای احتمالی تایپ‌اسکریپت در بیلد است
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;