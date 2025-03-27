import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  couchdb: {
    url: process.env.COUCHDB_URL || 'http://localhost:5984',
    username: process.env.COUCHDB_USERNAME || 'Meshack',
    password: process.env.COUCHDB_PASSWORD || '3.FocusMode',
    dbName: process.env.DB_NAME || 'eduapp'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info'
};

export default config;