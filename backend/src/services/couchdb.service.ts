import * as nano from 'nano';
import config from '../config/config';
import logger from '../config/logger';
import { CouchDBDocument } from '../types';

const couchdbConfig: nano.Configuration = {
  url: process.env.COUCHDB_URL || 'https://localhost:5984',
  requestDefaults: {
    auth: {
      username: process.env.COUCHDB_USERNAME || 'Meshack',
      password: process.env.COUCHDB_PASSWORD || '3.FocusMode'
    }
  }
};

const couchdb = nano(couchdbConfig);
const db = couchdb.use(process.env.DB_NAME || 'eduapp');

export const DatabaseService = {
  // Create a document
  async create<T extends { type: string }>(doc: T): Promise<T & CouchDBDocument> {
    try {
      const docToInsert = {
        ...doc,
        createdAt: new Date().toISOString()
      } as nano.MaybeDocument;

      const response = await db.insert(docToInsert);
      return {
        ...doc,
        _id: response.id,
        _rev: response.rev,
        createdAt: docToInsert.createdAt
      } as T & CouchDBDocument;
    } catch (error) {
      logger.error('Error creating document:', error);
      throw new Error('Failed to create document');
    }
  },

  // Read a document by ID
  async read<T>(id: string): Promise<T | null> {
    try {
      const doc = await db.get(id);
      return {
        ...doc,
        id: doc._id
      } as unknown as T;
    } catch (error) {
      if ((error as nano.DocumentNotFoundError).statusCode === 404) {
        return null;
      }
      logger.error(`Error reading document ${id}:`, error);
      throw new Error('Failed to read document');
    }
  },

  // Update a document
  async update<T extends { type: string }>(id: string, doc: Partial<T>): Promise<T> {
    try {
      const existing = await db.get(id);
      const updated = {
        ...existing,
        ...doc,
        updatedAt: new Date().toISOString()
      } as nano.MaybeDocument;

      const response = await db.insert(updated);
      return {
        ...updated,
        id: response.id
      } as unknown as T;
    } catch (error) {
      logger.error(`Error updating document ${id}:`, error);
      throw new Error('Failed to update document');
    }
  },

  // Delete a document
  async delete(id: string): Promise<boolean> {
    try {
      const doc = await db.get(id);
      await db.destroy(id, doc._rev);
      return true;
    } catch (error) {
      if ((error as nano.DocumentNotFoundError).statusCode === 404) {
        return false;
      }
      logger.error(`Error deleting document ${id}:`, error);
      throw new Error('Failed to delete document');
    }
  },

  // Find documents using Mango query
  async find<T>(query: nano.MangoQuery): Promise<T[]> {
    try {
      const { docs } = await db.find({
        selector: query,
        limit: 100
      });
      return docs.map(doc => ({
        ...doc,
        id: doc._id
      })) as unknown as T[];
    } catch (error) {
      logger.error('Error finding documents:', error);
      throw new Error('Failed to find documents');
    }
  },

  // List documents with pagination
  async list<T>(options: nano.DocumentListParams = {}): Promise<T[]> {
    try {
      const { rows } = await db.list({
        include_docs: true,
        ...options
      });
      return rows
        .filter(row => row.doc)
        .map(row => ({
          ...row.doc,
          id: row.id
        })) as unknown as T[];
    } catch (error) {
      logger.error('Error listing documents:', error);
      throw new Error('Failed to list documents');
    }
  }
};

// Initialize database connection
export const initializeDatabase = async (): Promise<void> => {
  try {
    await couchdb.db.get(process.env.DB_NAME || 'eduapp');
    logger.info('Connected to CouchDB database');
  } catch (error) {
    if ((error as nano.DocumentNotFoundError).statusCode === 404) {
      await couchdb.db.create(process.env.DB_NAME || 'eduapp');
      logger.info('Created new CouchDB database');
    } else {
      logger.error('Error initializing database:', error);
      throw new Error('Failed to initialize database');
    }
  }
};

export default DatabaseService;