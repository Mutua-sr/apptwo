"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.DatabaseService = void 0;
const logger_1 = __importDefault(require("../config/logger"));
const errorHandler_1 = require("../middleware/errorHandler");
const couchdbConfig = {
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
const couchdb = nano(couchdbConfig);
const db = couchdb.use(process.env.DB_NAME || 'eduapp');
exports.DatabaseService = {
    // Create a document
    async create(doc) {
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
            };
        }
        catch (error) {
            logger_1.default.error('Error creating document:', error);
            if (error.statusCode === 409) {
                throw new errorHandler_1.DatabaseError('Document already exists', 409);
            }
            if (error.statusCode === 400) {
                throw new errorHandler_1.DatabaseError('Invalid document format', 400);
            }
            throw new errorHandler_1.DatabaseError('Failed to create document');
        }
    },
    // Read a document by ID
    async read(id) {
        try {
            const doc = await db.get(id);
            return doc;
        }
        catch (error) {
            if (error.statusCode === 404) {
                return null;
            }
            logger_1.default.error(`Error reading document ${id}:`, error);
            if (error.statusCode === 400) {
                throw new errorHandler_1.DatabaseError('Invalid document ID', 400);
            }
            throw new errorHandler_1.DatabaseError('Failed to read document');
        }
    },
    // Update a document
    async update(id, doc) {
        try {
            const existing = await db.get(id);
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
            };
        }
        catch (error) {
            logger_1.default.error(`Error updating document ${id}:`, error);
            if (error.statusCode === 404) {
                throw new errorHandler_1.DatabaseError('Document not found', 404);
            }
            if (error.statusCode === 409) {
                throw new errorHandler_1.DatabaseError('Document update conflict', 409);
            }
            throw new errorHandler_1.DatabaseError('Failed to update document');
        }
    },
    // Delete a document
    async delete(id) {
        try {
            const doc = await db.get(id);
            await db.destroy(id, doc._rev);
            return true;
        }
        catch (error) {
            if (error.statusCode === 404) {
                return false;
            }
            logger_1.default.error(`Error deleting document ${id}:`, error);
            if (error.statusCode === 409) {
                throw new errorHandler_1.DatabaseError('Document delete conflict', 409);
            }
            throw new errorHandler_1.DatabaseError('Failed to delete document');
        }
    },
    // Find documents using Mango query
    async find(query) {
        try {
            const { docs } = await db.find(query);
            return docs;
        }
        catch (error) {
            logger_1.default.error('Error finding documents:', error);
            if (error.statusCode === 400) {
                throw new errorHandler_1.DatabaseError('Invalid query format', 400);
            }
            throw new errorHandler_1.DatabaseError('Failed to find documents');
        }
    },
    // List documents with pagination
    async list(options = {}) {
        try {
            const response = await db.list({
                include_docs: true,
                ...options
            });
            return response.rows
                .filter(row => row.doc)
                .map(row => row.doc);
        }
        catch (error) {
            logger_1.default.error('Error listing documents:', error);
            if (error.statusCode === 400) {
                throw new errorHandler_1.DatabaseError('Invalid list parameters', 400);
            }
            throw new errorHandler_1.DatabaseError('Failed to list documents');
        }
    },
    // Bulk operations
    async bulkCreate(docs) {
        try {
            const timestamp = new Date().toISOString();
            const docsToInsert = docs.map(doc => ({
                ...doc,
                createdAt: timestamp,
                updatedAt: timestamp
            }));
            const response = await db.bulk({ docs: docsToInsert });
            // Check for any errors in the bulk operation
            const errors = response.filter(res => res.error);
            if (errors.length > 0) {
                throw new errorHandler_1.DatabaseError('Some documents failed to create', 400, 'BULK_CREATE_PARTIAL_ERROR', errors);
            }
            return response.map((res, index) => ({
                ...docsToInsert[index],
                _id: res.id,
                _rev: res.rev
            }));
        }
        catch (error) {
            logger_1.default.error('Error bulk creating documents:', error);
            if (error instanceof errorHandler_1.DatabaseError) {
                throw error;
            }
            throw new errorHandler_1.DatabaseError('Failed to bulk create documents');
        }
    },
    // Check database connection
    async checkConnection() {
        try {
            await db.info();
            return true;
        }
        catch (error) {
            logger_1.default.error('Database connection error:', error);
            return false;
        }
    }
};
// Initialize database connection
const initializeDatabase = async () => {
    try {
        const dbExists = await exports.DatabaseService.checkConnection();
        if (!dbExists) {
            await couchdb.db.create(process.env.DB_NAME || 'eduapp');
            logger_1.default.info('Created new CouchDB database');
        }
        logger_1.default.info('Connected to CouchDB database');
    }
    catch (error) {
        logger_1.default.error('Error initializing database:', error);
        throw new errorHandler_1.DatabaseError('Failed to initialize database', 500, 'DATABASE_INIT_ERROR', error.message);
    }
};
exports.initializeDatabase = initializeDatabase;
exports.default = exports.DatabaseService;
//# sourceMappingURL=couchdb.service.js.map