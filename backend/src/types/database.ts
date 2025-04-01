export interface CouchDBDocument {
  _id: string;
  _rev?: string;  // Making _rev optional since it might not exist for new documents
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseQuery {
  selector: Record<string, any>;
  sort?: Array<Record<string, 'asc' | 'desc'>>;
  limit?: number;
  skip?: number;
  fields?: string[];
}

export interface DatabaseResponse<T> {
  ok: boolean;
  id: string;
  rev: string;
  data?: T;
}

export interface BulkDocsResponse {
  ok: boolean;
  id: string;
  rev: string;
  error?: string;
  reason?: string;
}

export interface DatabaseError extends Error {
  status?: number;
  statusCode?: number;
  error?: string;
  reason?: string;
}

// Generic type for database queries
export type DatabaseQueryResult<T extends CouchDBDocument> = T[];

// Type for database service methods
export interface IDatabaseService {
  create<T extends CouchDBDocument>(doc: Omit<T, '_id' | '_rev'>): Promise<T>;
  read<T extends CouchDBDocument>(id: string): Promise<T | null>;
  update<T extends CouchDBDocument>(id: string, doc: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  find<T extends CouchDBDocument>(query: DatabaseQuery): Promise<T[]>;
  bulkCreate<T extends CouchDBDocument>(docs: Array<Omit<T, '_id' | '_rev'>>): Promise<BulkDocsResponse[]>;
}