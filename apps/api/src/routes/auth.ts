import { Hono } from 'hono';
import { db } from '../db';
import { users, magicLinks } from '../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { sign, verify } from 'hono/jwt';
import { uid } from '@ananta/utils';

const JWT_SECRET = process.env.JWT_SECRET || 'ananta-dev-secret-change-in-production';
const ACCESS_TOKEN_TTL = 15 * 60; // 15 minutes in seconds
const REFRESH_TOKEN_TTL = 30 * 24 * 60 * 60; // 30 days in seconds
const MAGIC_LINK_TTL = 15 * 60; // 15 minutes

export const authRoutes = new Hono();

// POST /auth/register - Create account with email + password
authRoutes.post('/register', async (c) => {
  const { email, password, name, avatar } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400);
  }

  // Check if email already exists
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return c.json({ error: 'Email already registered' }, 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = uid();
  const userInviteCode = uid().toUpperCase().slice(0, 6);

  await db.insert(users).values({
    id: userId,
    email,
    passwordHash,
    name: name || '普贤居士',
    avatar: avatar || '普',
    inviteCode: userInviteCode,
    dataPublic: true,
    inRanking: true,
    allowFriendReq: true,
  });

  const accessToken = await sign(
    { sub: userId, email, exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL },
    JWT_SECRET,
    'HS256'
  );
  const refreshToken = await sign(
    { sub: userId, type: 'refresh', exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_TTL },
    JWT_SECRET,
    'HS256'
  );

  return c.json({ accessToken, refreshToken, userId });
});

// POST /auth/login - Email + password login
authRoutes.post('/login', async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400);
  }

  const result = await db.select().from(users).where(eq(users.email, email));
  const user = result[0];

  if (!user || !user.passwordHash) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  const accessToken = await sign(
    { sub: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL },
    JWT_SECRET,
    'HS256'
  );
  const refreshToken = await sign(
    { sub: user.id, type: 'refresh', exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_TTL },
    JWT_SECRET,
    'HS256'
  );

  return c.json({ accessToken, refreshToken, userId: user.id });
});

// POST /auth/refresh - Exchange refresh token for new access token
authRoutes.post('/refresh', async (c) => {
  const { refreshToken } = await c.req.json();

  if (!refreshToken) {
    return c.json({ error: 'Refresh token required' }, 400);
  }

  try {
    const payload = await verify(refreshToken, JWT_SECRET, 'HS256') as { sub: string; type?: string; email?: string };
    if (payload.type !== 'refresh') {
      return c.json({ error: 'Invalid token type' }, 401);
    }

    const result = await db.select().from(users).where(eq(users.id, payload.sub));
    const user = result[0];

    if (!user) return c.json({ error: 'User not found' }, 401);

    const accessToken = await sign(
      { sub: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL },
      JWT_SECRET,
      'HS256'
    );

    return c.json({ accessToken });
  } catch {
    return c.json({ error: 'Invalid refresh token' }, 401);
  }
});

// POST /auth/magic-link - Send password reset email
authRoutes.post('/magic-link', async (c) => {
  const { email } = await c.req.json();

  if (!email) {
    return c.json({ error: 'Email required' }, 400);
  }

  const result = await db.select().from(users).where(eq(users.email, email));
  const user = result[0];

  // Always return success to prevent email enumeration
  if (!user) {
    return c.json({ success: true, message: 'If email exists, magic link sent' });
  }

  const token = uid() + uid(); // 32-char hex
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL * 1000);

  await db.insert(magicLinks).values({
    id: uid(),
    email,
    code: token,
    expiresAt,
  });

  // In production: send email with magic link
  // For MVP: log to console
  console.log(`Magic link for ${email}: https://ananta.app/reset-password?token=${token}`);

  return c.json({ success: true });
});

// POST /auth/reset-password - Set new password via magic link
authRoutes.post('/reset-password', async (c) => {
  const { token, newPassword } = await c.req.json();

  if (!token || !newPassword) {
    return c.json({ error: 'Token and new password required' }, 400);
  }

  const result = await db.select().from(magicLinks).where(eq(magicLinks.code, token));
  const magicLink = result[0];

  if (!magicLink) {
    return c.json({ error: 'Invalid or expired token' }, 400);
  }

  if (magicLink.usedAt || new Date() > magicLink.expiresAt) {
    return c.json({ error: 'Token expired or already used' }, 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.email, magicLink.email));
  await db.update(magicLinks).set({ usedAt: new Date() }).where(eq(magicLinks.id, magicLink.id));

  return c.json({ success: true });
});

// POST /auth/logout - Client-side token deletion (no server state for JWT)
authRoutes.post('/logout', async (c) => {
  return c.json({ success: true });
});

// POST /auth/check — validate token or register anonymous user
authRoutes.post('/check', async (c) => {
  const body = await c.req.json();
  const { anonymousId, token } = body;

  // If token provided, try to verify and return user
  if (token) {
    try {
      const payload = await verify(token, JWT_SECRET, 'HS256') as { sub: string };
      const userId = payload.sub;
      const result = await db.select().from(users).where(eq(users.id, userId));
      if (result[0]) {
        return c.json({ user: result[0], token });
      }
    } catch {
      // Token invalid/expired — fall through to anonymous registration
    }
  }

  // Anonymous registration
  if (!anonymousId) {
    return c.json({ error: 'anonymousId or token required' }, 400);
  }

  // Check if user already exists
  let result = await db.select().from(users).where(eq(users.id, anonymousId));

  if (!result[0]) {
    // Create new anonymous user
    await db.insert(users).values({
      id: anonymousId,
      name: '普贤居士',
      avatar: anonymousId.slice(0, 1).toUpperCase(),
      bio: '',
      dataPublic: true,
      inRanking: true,
      allowFriendReq: true,
      fontScale: 1.0,
    });
    result = await db.select().from(users).where(eq(users.id, anonymousId));
  }

  const user = result[0];

  // Generate JWT
  const newToken = await sign(
    { sub: user.id, exp: Math.floor(Date.now() / 1000) + REFRESH_TOKEN_TTL },
    JWT_SECRET,
    'HS256'
  );

  return c.json({ user, token: newToken });
});
