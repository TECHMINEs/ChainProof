const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Evidence photos are stored on Cloudinary
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
  experimental: {
    serverComponentsExternalPackages: ['bull', 'ioredis', 'bcryptjs', 'snarkjs'],
  },
};

module.exports = withPWA(nextConfig);
