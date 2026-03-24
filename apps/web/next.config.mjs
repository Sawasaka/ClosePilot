/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@closepilot/db', '@closepilot/types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

export default nextConfig
