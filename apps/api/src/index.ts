import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { practiceRoutes } from './routes/practices';
import { campaignRoutes } from './routes/campaigns';
import { recordRoutes } from './routes/records';
import { userRoutes } from './routes/users';

const app = new Hono();

app.use('/*', cors({
  origin: ['http://localhost:3000', 'http://localhost:8081', 'http://localhost:19006'],
  credentials: true,
}));

app.route('/practices', practiceRoutes);
app.route('/campaigns', campaignRoutes);
app.route('/records', recordRoutes);
app.route('/users', userRoutes);

app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;
