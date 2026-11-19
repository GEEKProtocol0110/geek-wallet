import type { MetadataRoute } from "next";

const base = "https://wallet.geekprotocol.xyz";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/swap", "/privacy"].map(path => ({ url: `${base}${path}` }));
}
