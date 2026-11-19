import type { NextConfig } from "next";
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];
const nextConfig: NextConfig = {
  serverExternalPackages: ["@dfns/kaspa-wasm"],
  async headers() { return [{ source: "/:path*", headers: securityHeaders }]; },
};
export default nextConfig;
