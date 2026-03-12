import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typescript: {
    /* !! Esto ignora los errores de tipos durante el build*/
    ignoreBuildErrors: true,
  },
 
};

export default nextConfig;