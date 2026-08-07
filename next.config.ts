import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Genera .next/standalone (server + node_modules trazados) para la imagen
  // de Docker, en vez de depender de copiar node_modules completo.
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname),
  },
  // pdfkit resuelve sus archivos .afm de fuentes con __dirname en tiempo de
  // ejecucion; si el bundler lo empaqueta, __dirname deja de apuntar a
  // node_modules/pdfkit y la lectura del archivo falla. Se deja fuera del
  // bundle para que se cargue con require() nativo.
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
