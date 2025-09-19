/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jawalgames.net",
        port: "",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
