/**
 * MycoMiner Agent Runtime Server
 * Standalone backend service for agent orchestration
 */
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import route handlers
import agentRoutes from './routes/agent';
import governanceRoutes from './routes/governance';
import explainabilityRoutes from './routes/explainability';
import workflowRoutes from './routes/workflows';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Mount route handlers
app.use('/agent', agentRoutes);
app.use('/governance', governanceRoutes);
app.use('/explainability', explainabilityRoutes);
app.use('/workflows', workflowRoutes);

// Root health check
app.get('/', (_req: Request, res: Response) => {
  res.json({
    service: 'MycoMiner Agent Runtime',
    status: 'online',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message);
  console.error(err.stack);

  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🍄 MycoMiner Agent Runtime');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ CORS enabled for ${FRONTEND_URL}`);
  console.log('');
  console.log('Endpoints:');
  console.log(`  POST   http://localhost:${PORT}/agent/execute`);
  console.log(`  GET    http://localhost:${PORT}/agent/health`);
  console.log(`  GET    http://localhost:${PORT}/governance`);
  console.log(`  GET    http://localhost:${PORT}/explainability/graph/:sessionId`);
  console.log(`  POST   http://localhost:${PORT}/workflows`);
  console.log(`  GET    http://localhost:${PORT}/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

export default app;
