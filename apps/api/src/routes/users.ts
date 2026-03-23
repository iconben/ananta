import { Hono } from 'hono';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const userRoutes = new Hono();

userRoutes.get('/me', async (c) => {
  const id = c.req.query('id');
  if (!id) return c.json({ error: 'id required' }, 400);
  const result = await db.select().from(users).where(eq(users.id, id));
  return c.json(result[0] || null);
});

userRoutes.put('/me', async (c) => {
  const body = await c.req.json();
  const id = body.id;
  if (!id) return c.json({ error: 'id required' }, 400);
  delete body.id;
  await db.update(users).set(body).where(eq(users.id, id));
  return c.json({ success: true });
});

userRoutes.post('/', async (c) => {
  const body = await c.req.json();
  await db.insert(users).values(body);
  return c.json({ success: true });
});
