// Environment configuration for the API
// In production, set ALLOWED_ORIGINS as a comma-separated list of URLs

const rawOrigins = process.env.ALLOWED_ORIGINS ?? '';
export const ALLOWED_ORIGINS = rawOrigins
  ? rawOrigins.split(',').map((s) => s.trim())
  : ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:19006'];

export const DATABASE_URL = process.env.DATABASE_URL ?? '';
export const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
export const NODE_ENV = process.env.NODE_ENV ?? 'development';
