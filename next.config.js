/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: "/wikimujeres",
        destination: "/",
        permanent: true,
      },
    ];
  },
  images: {
    domains: [
      "img.icons8.com",
      "placehold.co",
      "res.cloudinary.com",
      "drive.google.com",
      "cdn.sanity.io",
      "wikimujeres.com",
      "qzpzjyljdlpxohqddayi.supabase.co",
    ],
  },
  compiler: {
    styledComponents: true,
  },
  transpilePackages: ["@react-google-maps/api"],
  webpack: (config) => {
    // This is specifically for handling the window is not defined error in Vercel
    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.fallback) {
      config.resolve.fallback = {};
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      window: false,
    };

    return config;
  },
};

module.exports = nextConfig;
