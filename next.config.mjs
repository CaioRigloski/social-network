/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    url: process.env.URL
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb"
    }
  }
}

export default nextConfig;
