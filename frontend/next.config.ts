import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Remove trailing slash from backend URL if present
    const backend = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
    return [
      // Proxy uploads through Next.js to avoid localhost image restrictions
      { source: "/uploads/:path*", destination: `${backend}/uploads/:path*` },
      // API rewrites
      { source: "/api/:path*/", destination: `${backend}/:path*/` },
      { source: "/api/:path*", destination: `${backend}/:path*` },
    ];
  },
};

export default nextConfig;
