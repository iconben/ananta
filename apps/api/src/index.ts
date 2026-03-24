import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { practiceRoutes } from './routes/practices';
import { campaignRoutes } from './routes/campaigns';
import { recordRoutes } from './routes/records';
import { userRoutes } from './routes/users';
import { friendshipRoutes } from './routes/friendships';
import { syncRoutes } from './routes/sync';
import { authRoutes } from './routes/auth';

const ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:8081,http://localhost:19006').split(',');

const app = new Hono();

app.use('/*', cors({
  origin: ALLOWED_ORIGINS,
  credentials: true,
}));

app.route('/practices', practiceRoutes);
app.route('/campaigns', campaignRoutes);
app.route('/records', recordRoutes);
app.route('/users', userRoutes);
app.route('/friends', friendshipRoutes);
app.route('/sync', syncRoutes);
app.route('/auth', authRoutes);

app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;
