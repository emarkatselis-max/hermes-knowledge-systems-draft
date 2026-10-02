import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Static build for GitHub Pages (project site served under /hermes-knowledge-systems-draft/).
// Only the public content pages are prerendered; the maintainer tool
// (/ergaleia/elegxos-readme) needs a server runtime and is intentionally excluded.
export const GITHUB_PAGES_BASE = "/hermes-knowledge-systems-draft/";

export const CONTENT_PAGES = [
  { path: "/" },
  { path: "/etaireia" },
  { path: "/ypiresies" },
  { path: "/erga-ekdoseis" },
  { path: "/etairika-stoixeia" },
  { path: "/epikoinonia" },
  { path: "/aporrito" },
];

export default defineConfig({
  vite: {
    base: GITHUB_PAGES_BASE,
  },
  tanstackStart: {
    router: {
      basepath: GITHUB_PAGES_BASE,
    },
    pages: CONTENT_PAGES,
    prerender: {
      enabled: true,
      crawlLinks: false,
      // Only the explicit CONTENT_PAGES — never auto-discover the maintainer route.
      autoStaticPathsDiscovery: false,
    },
  },
  nitro: {
    preset: "static",
  },
});
