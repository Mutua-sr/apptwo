import { MangoQuery, DocumentListParams } from 'nano';
import { CouchDBDocument } from '../types';
export declare const DatabaseService: {
    create<T extends CouchDBDocument>(doc: Omit<T, "_id" | "_rev" | "createdAt" | "updatedAt">): Promise<T>;
    read<T extends CouchDBDocument>(id: string): Promise<T | null>;
    update<T extends CouchDBDocument>(id: string, doc: Partial<T>): Promise<T>;
    delete(id: string): Promise<boolean>;
    find<T extends {
        type: string;
    }>(query: MangoQuery): Promise<Array<T & {
        _id: string;
        _rev?: string;
        createdAt: string;
        updatedAt: string;
    }>>;
    list<T extends CouchDBDocument>(options?: DocumentListParams): Promise<T[]>;
    bulkCreate<T extends CouchDBDocument>(docs: Array<Omit<T, "_id" | "_rev" | "createdAt" | "updatedAt">>): Promise<T[]>;
    checkConnection(): Promise<boolean>;
};
export declare const initializeDatabase: () => Promise<void>;
export default DatabaseService;
