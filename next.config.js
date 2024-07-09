/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      'img.icons8.com',
      'placehold.co',
      'res.cloudinary.com',
      'drive.google.com',
      'cdn.sanity.io',
    ],
  },
};

module.exports = nextConfig;
