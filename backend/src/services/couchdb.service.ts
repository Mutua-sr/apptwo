import { ServerScope, DocumentScope, MangoQuery, DocumentListParams, DocumentListResponse, DocumentBulkResponse } from 'nano';
import logger from '../config/logger';
import { CouchDBDocument } from '../types';
import { DatabaseError } from '../middleware/errorHandler';

interface CouchDBConfig {
  url: string;
  requestDefaults: {
    auth: {
      username: string;
      password: string;
    };
  };
}

const couchdbConfig: CouchDBConfig = {
  url: process.env.COUCHDB_URL || 'http://localhost:5984',
  requestDefaults: {
    auth: {
      username: process.env.COUCHDB_USERNAME || 'admin',
      password: process.env.COUCHDB_PASSWORD || 'password'
    }
  }
};

// Import nano as a require to avoid TypeScript issues
const nano = require('nano');
const couchdb: ServerScope = nano(couchdbConfig);
const db: DocumentScope<any> = couchdb.use(process.env.DB_NAME || 'eduapp');

export const DatabaseService = {
  // Create a document
  async create<T extends CouchDBDocument>(doc: Omit<T, '_id' | '_rev' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      const timestamp = new Date().toISOString();
      const docToInsert = {
        ...doc,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      const response = await db.insert(docToInsert);
      return {
        ...docToInsert,
        _id: response.id,
        _rev: response.rev
      } as T;
    } catch (error: any) {
      logger.error('Error creating document:', error);
      if (error.statusCode === 409) {
        throw new DatabaseError('Document already exists', 409);
      }
      if (error.statusCode === 400) {
        throw new DatabaseError('Invalid document format', 400);
      }
      throw new DatabaseError('Failed to create document');
    }
  },

  // Read a document by ID
  async read<T extends CouchDBDocument>(id: string): Promise<T | null> {
    try {
      const doc: T = await db.get(id);
      return doc;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return null;
      }
      logger.error(`Error reading document ${id}:`, error);
      if (error.statusCode === 400) {
        throw new DatabaseError('Invalid document ID', 400);
      }
      throw new DatabaseError('Failed to read document');
    }
  },

  // Update a document
  async update<T extends CouchDBDocument>(id: string, doc: Partial<T>): Promise<T> {
    try {
      const existing: T = await db.get(id);
      const updated = {
        ...existing,
        ...doc,
        updatedAt: new Date().toISOString()
      };

      const response = await db.insert(updated);
      return {
        ...updated,
        _id: response.id,
        _rev: response.rev
      } as T;
    } catch (error: any) {
      logger.error(`Error updating document ${id}:`, error);
      if (error.statusCode === 404) {
        throw new DatabaseError('Document not found', 404);
      }
      if (error.statusCode === 409) {
        throw new DatabaseError('Document update conflict', 409);
      }
      throw new DatabaseError('Failed to update document');
    }
  },

  // Delete a document
  async delete(id: string): Promise<boolean> {
    try {
      const doc = await db.get(id);
      await db.destroy(id, doc._rev);
      return true;
    } catch (error: any) {
      if (error.statusCode === 404) {
        return false;
      }
      logger.error(`Error deleting document ${id}:`, error);
      if (error.statusCode === 409) {
        throw new DatabaseError('Document delete conflict', 409);
      }
      throw new DatabaseError('Failed to delete document');
    }
  },

  // Find documents using Mango query
  async find<T extends CouchDBDocument>(query: MangoQuery): Promise<T[]> {
    try {
      const { docs } = await db.find(query);
      return docs as T[];
    } catch (error: any) {
      logger.error('Error finding documents:', error);
      if (error.statusCode === 400) {
        throw new DatabaseError('Invalid query format', 400);
      }
      throw new DatabaseError('Failed to find documents');
    }
  },

  // List documents with pagination
  async list<T extends CouchDBDocument>(options: DocumentListParams = {}): Promise<T[]> {
    try {
      const response: DocumentListResponse<T> = await db.list({
        include_docs: true,
        ...options
      });

      return response.rows
        .filter(row => row.doc)
        .map(row => row.doc as T);
    } catch (error: any) {
      logger.error('Error listing documents:', error);
      if (error.statusCode === 400) {
        throw new DatabaseError('Invalid list parameters', 400);
      }
      throw new DatabaseError('Failed to list documents');
    }
  },

  // Bulk operations
  async bulkCreate<T extends CouchDBDocument>(docs: Array<Omit<T, '_id' | '_rev' | 'createdAt' | 'updatedAt'>>): Promise<T[]> {
    try {
      const timestamp = new Date().toISOString();
      const docsToInsert = docs.map(doc => ({
        ...doc,
        createdAt: timestamp,
        updatedAt: timestamp
      }));

      const response: DocumentBulkResponse[] = await db.bulk({ docs: docsToInsert });
      
      // Check for any errors in the bulk operation
      const errors = response.filter(res => res.error);
      if (errors.length > 0) {
        throw new DatabaseError(
          'Some documents failed to create',
          400,
          'BULK_CREATE_PARTIAL_ERROR',
          errors
        );
      }

      return response.map((res, index) => ({
        ...docsToInsert[index],
        _id: res.id,
        _rev: res.rev
      })) as T[];
    } catch (error: any) {
      logger.error('Error bulk creating documents:', error);
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError('Failed to bulk create documents');
    }
  },

  // Check database connection
  async checkConnection(): Promise<boolean> {
    try {
      await db.info();
      return true;
    } catch (error) {
      logger.error('Database connection error:', error);
      return false;
    }
  }
};

// Create required indexes
const createRequiredIndexes = async () => {
  try {
    // Create index for posts sorted by createdAt
    await db.createIndex({
      index: {
        fields: ['type', 'createdAt']
      },
      ddoc: 'posts-by-date-index',
      type: 'json'
    });

    // Create index for posts by type
    await db.createIndex({
      index: {
        fields: ['type']
      },
      ddoc: 'posts-by-type-index',
      type: 'json'
    });
    
    logger.info('Created/Updated required database indexes');
  } catch (error: any) {
    logger.error('Error creating indexes:', error);
    throw new DatabaseError('Failed to create required indexes', 500);
  }
};

// Initialize database connection
export const initializeDatabase = async (): Promise<void> => {
  try {
    const dbExists = await DatabaseService.checkConnection();
    if (!dbExists) {
      await couchdb.db.create(process.env.DB_NAME || 'eduapp');
      logger.info('Created new CouchDB database');
    }
    // Create required indexes after ensuring database exists
    await createRequiredIndexes();
    logger.info('Connected to CouchDB database');
  } catch (error: any) {
    logger.error('Error initializing database:', error);
    throw new DatabaseError(
      'Failed to initialize database',
      500,
      'DATABASE_INIT_ERROR',
      error.message
    );
  }
};

export default DatabaseService;