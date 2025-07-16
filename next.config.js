/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.experiments = {
      ...(config.experiments || {}),
      asyncWebAssembly: true,
      layers: true, // ✅ Needed to avoid the Vercel build error
    };
    return config;
  },
};

module.exports = nextConfig;
