import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    url: process.env.URL
  },
  experimental: {
    serverActions: {
      bodySizeLimit: 5 * 1024 * 1024
    }
  },
  typescript: {
    ignoreBuildErrors: true
  }
}

export default withNextIntl(nextConfig);
