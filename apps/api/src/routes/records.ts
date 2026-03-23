import { Hono } from 'hono';
import { db } from '../db';
import { records } from '../db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export const recordRoutes = new Hono();

recordRoutes.get('/', async (c) => {
  const userId = c.req.query('userId');
  const practiceId = c.req.query('practiceId');
  const start = c.req.query('start');
  const end = c.req.query('end');

  let query = db.select().from(records);
  const conditions = [];

  if (userId) conditions.push(eq(records.userId, userId));
  if (practiceId) conditions.push(eq(records.practiceId, practiceId));
  if (start) conditions.push(gte(records.recordedAt, new Date(start)));
  if (end) conditions.push(lte(records.recordedAt, new Date(end)));

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const result = await query;
  return c.json(result);
});

recordRoutes.post('/', async (c) => {
  const body = await c.req.json();
  await db.insert(records).values(body);
  return c.json({ success: true });
});
