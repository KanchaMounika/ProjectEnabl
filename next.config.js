module.exports = {
  webpack: (config) => {
    config.experiments = { asyncWebAssembly: true };
    return config;
  },
   future: {
    turbo: false,  // Opt out of Turbopack
  },
};