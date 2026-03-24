import { Context, Next } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export const errorMiddleware = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (err: any) {
    console.error('Error:', err);
    return c.json(
      { error: err.message || 'Internal Server Error' },
      (err.status || 500) as ContentfulStatusCode
    );
  }
};
