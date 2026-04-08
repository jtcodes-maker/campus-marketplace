/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Change this URL to wherever your backend is running! 
        // If testing locally, it's usually http://localhost:5000/api/:path*
        // If testing against live Render, use your Render URL:
        destination: 'https://campus-marketplace-backend-wyx5.onrender.com/api/:path*', 
      },
    ]
  },
};

export default nextConfig;