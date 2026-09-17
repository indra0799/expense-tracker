import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});
const nextConfig: NextConfig = {
  // Add this line to silence the error if you don't need custom Turbopack options
  turbopack: {},
};

export default withPWA(nextConfig);