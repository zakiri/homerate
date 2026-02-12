/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_OSMO_RPC_URL: process.env.REACT_APP_OSMO_RPC_URL,
    NEXT_PUBLIC_OSMO_REST_URL: process.env.REACT_APP_OSMO_REST_URL,
    NEXT_PUBLIC_OSMO_CHAIN_ID: process.env.REACT_APP_OSMO_CHAIN_ID,
    NEXT_PUBLIC_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
  },
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ]
  }
}

export default nextConfig
