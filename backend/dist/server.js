"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const config_1 = __importDefault(require("./config/config"));
const logger_1 = __importDefault(require("./config/logger"));
const database_1 = require("./services/database");
const errorHandler_1 = require("./middleware/errorHandler");
const api_1 = __importDefault(require("./routes/api"));
const realtime_service_1 = __importDefault(require("./services/realtime.service"));
// Initialize express app
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Basic middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: config_1.default.cors.origin,
    credentials: config_1.default.cors.credentials
}));
// Mount API routes
app.use('/api', api_1.default);
// Error handling middleware
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
// Initialize Socket.IO with Realtime Service
realtime_service_1.default.initialize(httpServer);
// Start the server
const startServer = async () => {
    try {
        // Initialize database
        await (0, database_1.initializeDatabase)();
        logger_1.default.info('Database initialized successfully');
        // Start HTTP server
        httpServer.listen(config_1.default.port, () => {
            logger_1.default.info(`🚀 Server ready at http://localhost:${config_1.default.port}`);
            logger_1.default.info(`📝 REST API endpoints available at http://localhost:${config_1.default.port}/api`);
            logger_1.default.info(`🔌 WebSocket server is running`);
            // Log available endpoints
            logger_1.default.info('Available endpoints:');
            logger_1.default.info('POST   /api/auth/login     - Login user');
            logger_1.default.info('POST   /api/auth/register  - Register new user');
            logger_1.default.info('GET    /api/classrooms     - Get all classrooms');
            logger_1.default.info('POST   /api/classrooms     - Create new classroom');
            logger_1.default.info('GET    /api/classrooms/:id - Get classroom by ID');
            logger_1.default.info('PUT    /api/classrooms/:id - Update classroom');
            logger_1.default.info('DELETE /api/classrooms/:id - Delete classroom');
            logger_1.default.info('GET    /api/posts         - Get all posts');
            logger_1.default.info('POST   /api/posts         - Create new post');
            logger_1.default.info('GET    /api/posts/:id     - Get post by ID');
            logger_1.default.info('PUT    /api/posts/:id     - Update post');
            logger_1.default.info('DELETE /api/posts/:id     - Delete post');
            logger_1.default.info('GET    /api/communities   - Get all communities');
            logger_1.default.info('POST   /api/communities   - Create new community');
            logger_1.default.info('GET    /api/communities/:id - Get community by ID');
            logger_1.default.info('PUT    /api/communities/:id - Update community');
            logger_1.default.info('DELETE /api/communities/:id - Delete community');
            logger_1.default.info('GET    /api/chat/rooms    - Get all chat rooms');
            logger_1.default.info('POST   /api/chat/rooms    - Create new chat room');
            logger_1.default.info('GET    /api/chat/rooms/:id - Get chat room by ID');
            logger_1.default.info('GET    /api/chat/rooms/:id/messages - Get chat history');
            logger_1.default.info('POST   /api/chat/rooms/:id/messages - Send message');
            logger_1.default.info('DELETE /api/chat/messages/:id - Delete message');
            logger_1.default.info('POST   /api/video/call    - Create video call session');
            logger_1.default.info('GET    /api/video/call/:id - Get video call session');
            logger_1.default.info('PUT    /api/video/call/:id/status - Update call status');
            logger_1.default.info('PUT    /api/video/call/:id/end - End video call');
            logger_1.default.info('GET    /api/health        - Health check');
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    logger_1.default.error('Unhandled Rejection:', error);
    process.exit(1);
});
startServer().catch((error) => {
    logger_1.default.error('Unhandled server error:', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=server.js.map