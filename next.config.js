/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // swcPlugins: [['fluentui-next-appdir-directive', { paths: ['@griffel', '@fluentui'] }]],
  },
  transpilePackages: ['@fluentui/react-components'],
  images: {
    minimumCacheTTL: 60,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
