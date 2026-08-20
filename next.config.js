/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

// Nota: NO añadir aquí `serverActions.bodySizeLimit`. Solo afecta a Server
// Actions, no a las Route Handlers de /api/*, y da la falsa impresión de que
// el límite está subido. El tope real de /api/* en Vercel son 4.500.000 bytes
// de cuerpo, es de plataforma y no se puede configurar. Ver src/lib/file-upload.ts.

module.exports = nextConfig;
