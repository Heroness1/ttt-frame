/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@metamask/delegation-toolkit",
      "permissionless",
    ],
  },
};

export default nextConfig;
