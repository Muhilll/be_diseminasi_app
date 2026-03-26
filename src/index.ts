import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { loggerMiddleware, appTokenMiddleware } from './middleware/appToken';
import userRoutes from './app/user/route/user';
import roleRoutes from './app/role/route/role';
import menuRoutes from './app/menu/route/menu';
import gradeRoutes from './app/grade/route/grade';
import positionRoutes from './app/position/route/position';
import rolePermissionRoutes from './app/role_permission/route/role_permission';
import disseminationRoutes from './app/dissemination/route/dissemination';
import disseminationDetailRoutes from './app/dissemination_detail/route/dissemination_detail';

const app = new Hono();

// Global Middleware
app.use(logger());
app.use(loggerMiddleware);

// Welcome endpoint (Public)
app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'Welcome to API Diseminasi',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint (Public)
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes - Feature based
// Note: User routes have public login endpoint, others require JWT
app.route('/api/users', userRoutes);
app.route('/api/roles', roleRoutes);
app.route('/api/menus', menuRoutes);
app.route('/api/grades', gradeRoutes);
app.route('/api/positions', positionRoutes);
app.route('/api/role-permissions', rolePermissionRoutes);
app.route('/api/disseminations', disseminationRoutes);
app.route('/api/dissemination-details', disseminationDetailRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    message: 'Route not found',
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('[Error]', err);
  return c.json({
    success: false,
    message: err.message || 'Internal server error',
  }, 500);
});

export default {
  port: 4000,
  fetch: app.fetch,
} 