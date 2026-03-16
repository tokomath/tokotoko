/** @type {import('next').NextConfig} */
const nextConfig = {

  turbopack: {
    rules: {
      '.yaml': { as: 'string', loaders: ['raw-loader'] },
      '.yml': { as: 'string', loaders: ['raw-loader'] },
    },
  },

  experimental: {
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material'
    ],
  },

  webpack: (config) => {
    config.module.rules.push({
      test: /\.y?aml$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;