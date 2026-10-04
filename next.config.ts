import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // product photos are uploaded through server actions
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
