/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/__cad/:path*',
        destination: '/api/cad/:path*',
      },
    ];
  },
};

export default nextConfig;
