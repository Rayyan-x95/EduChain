/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@educhain/ui', '@educhain/types', '@educhain/validators', '@educhain/auth'],
};

module.exports = nextConfig;
