import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.103", "192.168.1.103:3000", "http://192.168.1.103:3000"],
  async headers() {
    return [
      {
        // Restrict webhook to originate from the public website domain only
        source: "/api/webhook/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.WEBSITE_ORIGIN || "https://www.yourdomain.com",
          },
          { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
      {
        // Internal CRM API — allow same-origin only (no wildcard)
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "http://192.168.1.103:3000" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
