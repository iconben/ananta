import { Context, Next } from 'hono';
import { verify } from 'hono/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'ananta-dev-secret-change-in-production';

// Auth middleware - requires valid JWT
export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);
  try {
    const payload = await verify(token, JWT_SECRET, 'HS256') as { sub: string; email?: string };
    c.set('userId', payload.sub);
    c.set('userEmail', payload.email);
    await next();
  } catch {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }
};

// Optional auth middleware - sets userId if token present, but allows anonymous access
export const optionalAuthMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const payload = await verify(token, JWT_SECRET, 'HS256') as { sub: string; email?: string };
      c.set('userId', payload.sub);
      c.set('userEmail', payload.email);
    } catch {
      // Invalid token - continue as anonymous
    }
  }
  await next();
};
