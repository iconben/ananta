import { Hono } from 'hono';
import { db } from '../db';
import { practices, campaigns, records, users } from '../db/schema';
import { eq } from 'drizzle-orm';

export const syncRoutes = new Hono();

type SyncUser = typeof users.$inferInsert;
type SyncPractice = typeof practices.$inferInsert;
type SyncCampaign = typeof campaigns.$inferInsert;
type SyncRecord = typeof records.$inferInsert;

interface SyncPayload {
  user?: SyncUser;
  practices?: SyncPractice[];
  campaigns?: SyncCampaign[];
  records?: SyncRecord[];
  lastSyncedAt?: string;
}

// Bulk upsert user
syncRoutes.post('/user', async (c) => {
  const body: SyncUser = await c.req.json();
  await db.insert(users).values(body).onConflictDoUpdate({
    target: users.id,
    set: body,
  });
  return c.json({ success: true });
});

// Bulk upsert practices
syncRoutes.post('/practices', async (c) => {
  const body: SyncPractice[] = await c.req.json();
  for (const practice of body) {
    await db.insert(practices).values(practice).onConflictDoUpdate({
      target: practices.id,
      set: practice,
    });
  }
  return c.json({ success: true });
});

// Bulk upsert campaigns
syncRoutes.post('/campaigns', async (c) => {
  const body: SyncCampaign[] = await c.req.json();
  for (const campaign of body) {
    await db.insert(campaigns).values(campaign).onConflictDoUpdate({
      target: campaigns.id,
      set: campaign,
    });
  }
  return c.json({ success: true });
});

// Bulk upsert records
syncRoutes.post('/records', async (c) => {
  const body: SyncRecord[] = await c.req.json();
  for (const record of body) {
    await db.insert(records).values(record).onConflictDoUpdate({
      target: records.id,
      set: record,
    });
  }
  return c.json({ success: true });
});

// Fetch all data for a user (full sync)
syncRoutes.get('/fetch/:userId', async (c) => {
  const userId = c.req.param('userId');

  const userResult = await db.select().from(users).where(eq(users.id, userId));
  const practicesResult = await db.select().from(practices).where(eq(practices.userId, userId));
  const campaignsResult = await db.select().from(campaigns).where(eq(campaigns.userId, userId));
  const recordsResult = await db.select().from(records).where(eq(records.userId, userId));

  return c.json({
    user: userResult[0] || null,
    practices: practicesResult,
    campaigns: campaignsResult,
    records: recordsResult,
    syncedAt: new Date().toISOString(),
  });
});

// Incremental sync - fetch records updated since lastSyncedAt
syncRoutes.get('/fetch/:userId/incremental', async (c) => {
  const userId = c.req.param('userId');
  const lastSyncedAt = c.req.query('lastSyncedAt');

  if (!lastSyncedAt) {
    return c.json({ error: 'lastSyncedAt query param required' }, 400);
  }

  const lastDate = new Date(lastSyncedAt);

  const practicesResult = await db.select().from(practices).where(eq(practices.userId, userId));
  const campaignsResult = await db.select().from(campaigns).where(eq(campaigns.userId, userId));
  const recordsResult = await db
    .select()
    .from(records)
    .where(eq(records.userId, userId));

  // Filter records by updated time (using recordedAt as proxy for last update)
  const updatedRecords = recordsResult.filter(
    (r) => r.recordedAt && new Date(r.recordedAt) > lastDate
  );

  return c.json({
    practices: practicesResult,
    campaigns: campaignsResult,
    records: updatedRecords,
    syncedAt: new Date().toISOString(),
  });
});

// Full sync endpoint - accepts all data in one request
syncRoutes.post('/sync', async (c) => {
  const body: SyncPayload = await c.req.json();

  if (body.user) {
    await db.insert(users).values(body.user).onConflictDoUpdate({
      target: users.id,
      set: body.user,
    });
  }

  if (body.practices) {
    for (const practice of body.practices) {
      await db.insert(practices).values(practice).onConflictDoUpdate({
        target: practices.id,
        set: practice,
      });
    }
  }

  if (body.campaigns) {
    for (const campaign of body.campaigns) {
      await db.insert(campaigns).values(campaign).onConflictDoUpdate({
        target: campaigns.id,
        set: campaign,
      });
    }
  }

  if (body.records) {
    for (const record of body.records) {
      await db.insert(records).values(record).onConflictDoUpdate({
        target: records.id,
        set: record,
      });
    }
  }

  return c.json({
    success: true,
    syncedAt: new Date().toISOString(),
  });
});
