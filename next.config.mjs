/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false, // เปิดการ optimize รูปภาพ
    formats: ['image/webp', 'image/avif'], // ใช้ format ที่เบากว่า
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // ขนาดที่รองรับ
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // ขนาดรูปเล็ก
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache 30 วัน
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
