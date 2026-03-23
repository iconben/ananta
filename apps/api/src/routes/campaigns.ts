import { Hono } from 'hono';
import { db } from '../db';
import { campaigns } from '../db/schema';
import { eq } from 'drizzle-orm';

export const campaignRoutes = new Hono();

campaignRoutes.get('/', async (c) => {
  const userId = c.req.query('userId');
  if (!userId) return c.json({ error: 'userId required' }, 400);
  const result = await db.select().from(campaigns).where(eq(campaigns.userId, userId));
  return c.json(result);
});

campaignRoutes.post('/', async (c) => {
  const body = await c.req.json();
  await db.insert(campaigns).values(body);
  return c.json({ success: true });
});

campaignRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  const result = await db.select().from(campaigns).where(eq(campaigns.id, id));
  return c.json(result[0] || null);
});

campaignRoutes.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  await db.update(campaigns).set(body).where(eq(campaigns.id, id));
  return c.json({ success: true });
});

campaignRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await db.delete(campaigns).where(eq(campaigns.id, id));
  return c.json({ success: true });
});
