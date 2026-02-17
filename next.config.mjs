/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000', // Allow local development
        'gq2wwk1v-3000.inc1.devtunnels.ms', // Specific tunnel URL
        '*.inc1.devtunnels.ms', // Wildcard for dynamic devtunnels.ms subdomains
      ],
    },
  }
};

export default nextConfig;
