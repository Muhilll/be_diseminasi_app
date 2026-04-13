import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { loggerMiddleware } from './middleware/appToken';
import userRoutes from './app/user/route/user.route';
import roleRoutes from './app/role/route/role.route';
import menuRoutes from './app/menu/route/menu.route';
import gradeRoutes from './app/grade/route/grade.route';
import positionRoutes from './app/position/route/position.route';
import rolePermissionRoutes from './app/role_permission/route/role-permission.route';
import disseminationRoutes from './app/dissemination/route/dissemination.route';
import disseminationDetailRoutes from './app/dissemination_detail/route/dissemination-detail.route';
import absensiRoutes from './app/absensi/route/absensi.route';
import { UserService } from './app/user/service/user.service';

const app = new Hono();

// Global Middleware
app.use(cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-App-Token'],
  credentials: true,
}));
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

// Cek DB
app.get('/api/cek-db', async (c) => {
  const users = await UserService.getAllUsers();

  return c.json({
    success: true,
    message: 'API is running',
    data: users,
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
app.route('/api/absensis', absensiRoutes);

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

export default app;