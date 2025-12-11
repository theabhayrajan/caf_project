/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: false,
  },
  basePath: '/caf',
  assetPrefix: '/caf',
  trailingSlash: true,
};

module.exports = nextConfig;
