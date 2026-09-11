import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    DIRECT_URL: process.env.DIRECT_URL ?? "",
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "",
  },
};

export default nextConfig;
