import { Hono } from 'hono';
import { StatusCode } from 'hono/utils/http-status';

export const errorMiddleware = async (c: Hono, next: () => Promise<void>) => {
  try {
    await next();
  } catch (err: any) {
    console.error('Error:', err);
    return c.json(
      { error: err.message || 'Internal Server Error' },
      (err.status || 500) as StatusCode
    );
  }
};
