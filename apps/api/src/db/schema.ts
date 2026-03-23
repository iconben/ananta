import { pgTable, text, bigint, boolean, date, timestamp, real } from 'drizzle-orm/pg-core';

export const practices = pgTable('practices', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  unit: text('unit').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const campaigns = pgTable('campaigns', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  practiceId: text('practice_id').notNull().references(() => practices.id),
  name: text('name').notNull(),
  goal: bigint('goal', { mode: 'number' }).notNull(),
  progress: bigint('progress', { mode: 'number' }).default(0),
  start: date('start').notNull(),
  end: date('end').notNull(),
  done: boolean('done').default(false),
  retreatId: text('retreat_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const records = pgTable('records', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  practiceId: text('practice_id').notNull().references(() => practices.id),
  campaignId: text('campaign_id').references(() => campaigns.id),
  count: bigint('count', { mode: 'number' }).notNull(),
  note: text('note'),
  recordedAt: timestamp('recorded_at').defaultNow(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').unique(),
  passwordHash: text('password_hash'),
  name: text('name').default('普贤居士'),
  avatar: text('avatar').default('普'),
  bio: text('bio').default(''),
  dataPublic: boolean('data_public').default(true),
  inRanking: boolean('in_ranking').default(true),
  allowFriendReq: boolean('allow_friend_req').default(true),
  fontScale: real('font_scale').default(1.0),
  createdAt: timestamp('created_at').defaultNow(),
});
