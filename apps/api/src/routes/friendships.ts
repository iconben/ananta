import { Hono } from 'hono';
import { db } from '../db';
import { friendships, users, records, practices } from '../db/schema';
import { eq, and, or, desc, sql, gte } from 'drizzle-orm';
import { uid } from '@ananta/utils';

export const friendshipRoutes = new Hono();

// Send a friend request
friendshipRoutes.post('/', async (c) => {
  const { requesterId, addresseeId } = await c.req.json();
  if (!requesterId || !addresseeId) {
    return c.json({ error: 'requesterId and addresseeId required' }, 400);
  }
  if (requesterId === addresseeId) {
    return c.json({ error: 'Cannot friend yourself' }, 400);
  }

  // Check if friendship already exists
  const existing = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, requesterId), eq(friendships.addresseeId, addresseeId)),
        and(eq(friendships.requesterId, addresseeId), eq(friendships.addresseeId, requesterId))
      )
    );

  if (existing.length > 0) {
    return c.json({ error: 'Friendship already exists', status: existing[0].status }, 400);
  }

  const id = uid();
  await db.insert(friendships).values({ id, requesterId, addresseeId, status: 'pending' });
  return c.json({ id, status: 'pending' }, 201);
});

// Get friendship status between two users
friendshipRoutes.get('/status', async (c) => {
  const userId = c.req.query('userId');
  const otherId = c.req.query('otherId');
  if (!userId || !otherId) {
    return c.json({ error: 'userId and otherId required' }, 400);
  }

  const result = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(eq(friendships.requesterId, userId), eq(friendships.addresseeId, otherId)),
        and(eq(friendships.requesterId, otherId), eq(friendships.addresseeId, userId))
      )
    );

  if (result.length === 0) {
    return c.json({ status: 'none' });
  }
  return c.json({ status: result[0].status, id: result[0].id });
});

// List all friends for a user
friendshipRoutes.get('/', async (c) => {
  const userId = c.req.query('userId');
  if (!userId) return c.json({ error: 'userId required' }, 400);

  // Get accepted friendships where user is either requester or addressee
  const result = await db
    .select({
      friendship: friendships,
      user: users,
    })
    .from(friendships)
    .innerJoin(users, or(
      and(eq(friendships.requesterId, userId), eq(users.id, friendships.addresseeId)),
      and(eq(friendships.addresseeId, userId), eq(users.id, friendships.requesterId))
    ))
    .where(eq(friendships.status, 'accepted'));

  const friends = result.map((r) => ({
    id: r.user.id,
    name: r.user.name,
    avatar: r.user.avatar,
    bio: r.user.bio,
    since: r.friendship.updatedAt,
  }));

  return c.json(friends);
});

// List pending incoming friend requests for a user
friendshipRoutes.get('/requests', async (c) => {
  const userId = c.req.query('userId');
  if (!userId) return c.json({ error: 'userId required' }, 400);

  const result = await db
    .select({
      friendship: friendships,
      requester: users,
    })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.requesterId))
    .where(and(eq(friendships.addresseeId, userId), eq(friendships.status, 'pending')));

  const requests = result.map((r) => ({
    id: r.friendship.id,
    fromUser: {
      id: r.requester.id,
      name: r.requester.name,
      avatar: r.requester.avatar,
      bio: r.requester.bio,
    },
    createdAt: r.friendship.createdAt,
  }));

  return c.json(requests);
});

// Accept a friend request
friendshipRoutes.put('/:id/accept', async (c) => {
  const id = c.req.param('id');
  await db
    .update(friendships)
    .set({ status: 'accepted', updatedAt: new Date() })
    .where(eq(friendships.id, id));
  return c.json({ success: true });
});

// Reject a friend request
friendshipRoutes.put('/:id/reject', async (c) => {
  const id = c.req.param('id');
  await db
    .update(friendships)
    .set({ status: 'rejected', updatedAt: new Date() })
    .where(eq(friendships.id, id));
  return c.json({ success: true });
});

// Remove a friend
friendshipRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  await db.delete(friendships).where(eq(friendships.id, id));
  return c.json({ success: true });
});

// Activity feed - recent public records from friends
friendshipRoutes.get('/feed', async (c) => {
  const userId = c.req.query('userId');
  const limit = parseInt(c.req.query('limit') || '20', 10);
  const since = c.req.query('since');

  if (!userId) return c.json({ error: 'userId required' }, 400);

  // Get friend IDs
  const friendIds = await db
    .select({
      friendId: sql<string>`CASE WHEN ${friendships.requesterId} = ${userId} THEN ${friendships.addresseeId} ELSE ${friendships.requesterId} END`,
    })
    .from(friendships)
    .where(and(
      or(eq(friendships.requesterId, userId), eq(friendships.addresseeId, userId)),
      eq(friendships.status, 'accepted')
    ));

  if (friendIds.length === 0) {
    return c.json([]);
  }

  const friendIdList = friendIds.map((f) => f.friendId);

  // Build conditions: friends' public records
  const conditions = [
    sql`${records.userId} IN (${sql.join(friendIdList.map(id => sql`${id}`), sql`, `)})`,
  ];

  if (since) {
    conditions.push(gte(records.recordedAt, new Date(since)));
  }

  const result = await db
    .select({
      record: records,
      user: users,
      practice: practices,
    })
    .from(records)
    .innerJoin(users, eq(records.userId, users.id))
    .innerJoin(practices, eq(records.practiceId, practices.id))
    .where(and(...conditions))
    .orderBy(desc(records.recordedAt))
    .limit(limit);

  const feed = result.map((r) => ({
    id: r.record.id,
    userId: r.user.id,
    userName: r.user.name,
    userAvatar: r.user.avatar,
    practiceId: r.record.practiceId,
    practiceName: r.practice.name,
    practiceIcon: r.practice.icon,
    count: r.record.count,
    note: r.record.note,
    recordedAt: r.record.recordedAt,
  }));

  return c.json(feed);
});

// Leaderboard - ranked users by total practice counts
friendshipRoutes.get('/leaderboard', async (c) => {
  const limit = parseInt(c.req.query('limit') || '20', 10);
  const practiceId = c.req.query('practiceId');

  let query = db
    .select({
      userId: records.userId,
      userName: users.name,
      userAvatar: users.avatar,
      total: sql<number>`SUM(${records.count})`,
    })
    .from(records)
    .innerJoin(users, eq(records.userId, users.id))
    .where(eq(users.inRanking, true))
    .groupBy(records.userId, users.name, users.avatar)
    .orderBy(desc(sql`SUM(${records.count})`))
    .limit(limit);

  if (practiceId) {
    // Filter by specific practice
    const result = await db
      .select({
        userId: records.userId,
        userName: users.name,
        userAvatar: users.avatar,
        total: sql<number>`SUM(${records.count})`,
      })
      .from(records)
      .innerJoin(users, eq(records.userId, users.id))
      .where(and(eq(users.inRanking, true), eq(records.practiceId, practiceId)))
      .groupBy(records.userId, users.name, users.avatar)
      .orderBy(desc(sql`SUM(${records.count})`))
      .limit(limit);

    return c.json(result.map((r, i) => ({ rank: i + 1, ...r })));
  }

  const result = await query;
  return c.json(result.map((r, i) => ({ rank: i + 1, ...r })));
});
