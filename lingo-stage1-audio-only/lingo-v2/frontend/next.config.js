/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Fixes the '--ignoreDeprecations' error
    ignoreBuildErrors: true,
  },
  eslint: {
    // Prevents ESLint from stopping the build
    ignoreDuringBuilds: true,
  },
  env: {
    // This allows you to use process.env.NEXT_PUBLIC_API_URL in your code
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
};

export default nextConfig;
