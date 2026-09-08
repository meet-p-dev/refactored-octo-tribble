import fs from "fs";

const repoBase = "/refactored-octo-tribble";
const version = fs.readFileSync(new URL("./VERSION", import.meta.url), "utf8").trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: repoBase,
  assetPrefix: `${repoBase}/`,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_MT_VERSION: version,
  },
};

export default nextConfig;
