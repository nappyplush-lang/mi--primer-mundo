// Export estático para GitHub Pages: https://nappyplush-lang.github.io/mi--primer-mundo/dasa-web/
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath,
  images: { unoptimized: true },
  trailingSlash: true,
};
export default nextConfig;
