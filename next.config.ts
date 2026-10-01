import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // one upload (photo or report, 5 MB max on the API) plus the form fields
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
