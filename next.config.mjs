/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      allowedOrigins: ["https://gfc4p7fz-3000.inc1.devtunnels.ms", "http://localhost:3000"]
    }
  }
};

export default nextConfig;
