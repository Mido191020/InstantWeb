import type { NextConfig } from "next";

/**
 * ASSET PATH ASSUMPTIONS (Production Build):
 * 
 * 1. Static assets in /public/ are served from /_next/static/
 * 2. Template HTML files use relative paths that resolve correctly
 * 3. Google Fonts CDN load independently (no bundling needed)
 */

const nextConfig: NextConfig = {
  // Standalone output for Vercel deployment
  output: 'standalone',

  turbopack: {
    // Set root explicitly to this project directory to avoid lockfile detection issues
    root: process.cwd(),
  },
};

export default nextConfig;



