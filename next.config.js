// calcelectric/next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        port: '',
      },
    ],
  },
  // Aqui você pode adicionar outras configurações do Next.js se tiver (ex: experimental, webpack, etc.)
};

module.exports = nextConfig; // Apenas exporte a configuração pura