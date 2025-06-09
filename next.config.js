/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is default in Next.js 15 - no experimental flag needed
  serverExternalPackages: ['@meshsdk/core', '@meshsdk/wallet'],
  
  // PWA and performance optimizations
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Image optimization for DRep avatars and proposals
  images: {
    domains: ['api.dicebear.com', 'ipfs.io', 'gateway.pinata.cloud'],
    formats: ['image/webp', 'image/avif'],
  },

  // Bundle analyzer for performance monitoring
  webpack: (config, { dev, isServer }) => {
    // Optimize for Cardano wallet libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Bundle size optimization
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          cardano: {
            test: /[\\/]node_modules[\\/]@meshsdk[\\/]/,
            name: 'cardano',
            chunks: 'all',
          },
          radix: {
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            name: 'radix',
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },

  // Security headers
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // Environment variable validation
  env: {
    NEXT_PUBLIC_CARDANO_NETWORK: process.env.NEXT_PUBLIC_CARDANO_NETWORK || 'mainnet',
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
  },

  // Accessibility and SEO
  async redirects() {
    return [
      {
        source: '/governance',
        destination: '/proposals',
        permanent: true,
      },
    ];
  },

  // Performance optimizations (swcMinify is default in Next.js 15)
  compress: true,
  poweredByHeader: false,
  
  // Static export for enhanced performance
  trailingSlash: false,
  output: 'standalone',
};

module.exports = nextConfig;