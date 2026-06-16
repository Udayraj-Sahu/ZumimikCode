/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = ["web", "es2020"];
    }
    return config;
  },
};

export default nextConfig;
