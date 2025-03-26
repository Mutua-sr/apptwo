import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import config from './config/config';
import logger from './config/logger';
import { initializeDatabase } from './services/database';
import { errorHandler, notFound } from './middleware/errorHandler';
import apiRoutes from './routes/api';
import SocketService from './services/socket.service';

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Basic middleware
app.use(express.json());
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials
}));

// Mount API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Initialize Socket.IO
SocketService.initialize(httpServer);

// Start the server
const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    logger.info('Database initialized successfully');

    // Start HTTP server
    httpServer.listen(config.port, () => {
      logger.info(`🚀 Server ready at http://localhost:${config.port}`);
      logger.info(`📝 REST API endpoints available at http://localhost:${config.port}/api`);
      logger.info(`🔌 WebSocket server is running`);
      
      // Log available endpoints
      logger.info('Available endpoints:');
      logger.info('POST   /api/auth/login     - Login user');
      logger.info('POST   /api/auth/register  - Register new user');
      logger.info('GET    /api/classrooms     - Get all classrooms');
      logger.info('POST   /api/classrooms     - Create new classroom');
      logger.info('GET    /api/classrooms/:id - Get classroom by ID');
      logger.info('PUT    /api/classrooms/:id - Update classroom');
      logger.info('DELETE /api/classrooms/:id - Delete classroom');
      logger.info('GET    /api/posts         - Get all posts');
      logger.info('POST   /api/posts         - Create new post');
      logger.info('GET    /api/posts/:id     - Get post by ID');
      logger.info('PUT    /api/posts/:id     - Update post');
      logger.info('DELETE /api/posts/:id     - Delete post');
      logger.info('GET    /api/communities   - Get all communities');
      logger.info('POST   /api/communities   - Create new community');
      logger.info('GET    /api/communities/:id - Get community by ID');
      logger.info('PUT    /api/communities/:id - Update community');
      logger.info('DELETE /api/communities/:id - Delete community');
      logger.info('GET    /api/chat/:roomId/messages - Get chat history');
      logger.info('POST   /api/chat/:roomId/messages - Send message');
      logger.info('DELETE /api/chat/messages/:messageId - Delete message');
      logger.info('GET    /api/health        - Health check');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

startServer().catch((error) => {
  logger.error('Unhandled server error:', error);
  process.exit(1);
});

export default app;