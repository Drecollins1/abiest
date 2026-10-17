import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // product photos are uploaded through server actions
    serverActions: { bodySizeLimit: "4.5mb" },
  },
};

export default nextConfig;
