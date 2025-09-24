/** @type {import('next').NextConfig} */
const nextConfig = {
    modularizeImports: {
        '@mui/material': {
            transform: '@mui/material/{{member}}',
        },
        '@mui/icons-material': {
            transform: '@mui/icons-material/{{member}}',
        },
    },
    webpack: (config) => {
    config.module.rules.push({
      test: /\.y?aml$/,
      type: 'asset/source',
    })
    return config
  }
};

export default nextConfig;
