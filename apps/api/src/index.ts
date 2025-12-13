import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/users';
import { workspaceRouter } from './routes/workspaces';
import { contentRouter } from './routes/content';
import { insightRouter } from './routes/insights';
import { noteRouter } from './routes/notes';
import { dashboardRouter } from './routes/dashboard';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (_, res) => {
  res.json({ 
    name: 'InfluiX API',
    version: '0.1.0',
    docs: '/api/v1',
  });
});

// API routes
const API_PREFIX = '/api/v1';
app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/users`, userRouter);
app.use(`${API_PREFIX}/workspaces`, workspaceRouter);
app.use(`${API_PREFIX}/content`, contentRouter);
app.use(`${API_PREFIX}/insights`, insightRouter);
app.use(`${API_PREFIX}/notes`, noteRouter);
app.use(`${API_PREFIX}/dashboard`, dashboardRouter);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 InfluiX API running on http://localhost:${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}${API_PREFIX}`);
});

export default app;
