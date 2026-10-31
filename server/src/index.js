import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';

import repoRoutes from './routes/repo.routes.js';
import analysisRoutes from './routes/analysis.routes.js';
import bugRoutes from './routes/bug.routes.js';
import docRoutes from './routes/doc.routes.js';
import prRoutes from './routes/pr.routes.js';
import agentRoutes from './routes/agent.routes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI Developer Assistant Engine',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/repos', repoRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/docs', docRoutes);
app.use('/api/prs', prRoutes);
app.use('/api/agent', agentRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Bootstrapper
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(`🤖 AI Developer Assistant Server running on port ${config.port}`);
      console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
      console.log(`⚡ OpenAI API Configured: ${Boolean(config.openaiApiKey)}`);
      console.log(`🐙 GitHub Token Configured: ${Boolean(config.githubToken)}`);
      console.log(`====================================================`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received. Closing HTTP server...');
      server.close(() => console.log('HTTP server closed.'));
    });
  } catch (error) {
    console.error('Fatal initialization error:', error);
    process.exit(1);
  }
};

startServer();
