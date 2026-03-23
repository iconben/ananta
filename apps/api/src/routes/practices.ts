import { Hono } from 'hono';
import { db } from '../db';
import { practices } from '../db/schema';
import { eq } from 'drizzle-orm';

export const practiceRoutes = new Hono();

practiceRoutes.get('/', async (c) => {
  const userId = c.req.query('userId');
  if (!userId) return c.json({ error: 'userId required' }, 400);
  const result = await db.select().from(practices).where(eq(practices.userId, userId));
  return c.json(result);
});

practiceRoutes.post('/', async (c) => {
  const body = await c.req.json();
  await db.insert(practices).values(body);
  return c.json({ success: true });
});

practiceRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await db.select().from(practices).where(eq(practices.id, id));
  return c.json(result[0] || null);
});

practiceRoutes.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  await db.update(practices).set(body).where(eq(practices.id, id));
  return c.json({ success: true });
});

practiceRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await db.delete(practices).where(eq(practices.id, id));
  return c.json({ success: true });
});
