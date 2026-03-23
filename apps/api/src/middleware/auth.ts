import { Context, Next } from 'hono';
import { Hono } from 'hono';

// Placeholder auth middleware - in Phase 2 this will verify JWT tokens
export const authMiddleware = async (c: Context, next: Next) => {
  // In Phase 1, we just pass through
  // In Phase 2, this will verify the JWT from Authorization header
  await next();
};
