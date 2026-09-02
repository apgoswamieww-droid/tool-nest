/** @type {import('next').NextConfig} */
const nextConfig = {
  /* Enable static exports for tools that use generateStaticParams */
  output: undefined,

  /* Image optimization */
  images: {
    formats: ["image/avif", "image/webp"],
  },

  /* Redirect trailing slashes */
  trailingSlash: false,

  /* React strict mode */
  reactStrictMode: true,
};

export default nextConfig;
