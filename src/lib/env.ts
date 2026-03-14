/**
 * Typed environment variable access.
 * Throws at build/startup if required server-side vars are missing.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string): string | undefined {
  return process.env[name] || undefined;
}

// Server-side only — never exposed to client
export const env = {
  gemini: {
    apiKey: () => requireEnv("GEMINI_API_KEY"),
  },
  cloudinary: {
    cloudName: () => requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    apiKey: () => requireEnv("CLOUDINARY_API_KEY"),
    apiSecret: () => requireEnv("CLOUDINARY_API_SECRET"),
  },
  googleMaps: {
    apiKey: () => requireEnv("GOOGLE_MAPS_API_KEY"),
  },
  pcExpress: {
    apiKey: () => optionalEnv("PC_EXPRESS_API_KEY"),
  },
} as const;
