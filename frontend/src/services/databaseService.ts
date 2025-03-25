import { gql } from '@apollo/client';
import { apolloClient } from './apiService';

export interface DatabaseDocument {
  _id?: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

const GET_DOCUMENTS = gql`
  query GetDocuments($type: String!, $query: JSON) {
    documents(type: $type, query: $query) {
      _id
      type
      createdAt
      updatedAt
      ... on Post {
        title
        content
        author
        avatar
        likes
        likedBy
        comments
        tags
        sharedTo
      }
      ... on Community {
        name
        description
        members
        topics
        avatar
      }
      ... on Classroom {
        name
        description
        instructor
        students
        topics
      }
    }
  }
`;

const GET_DOCUMENT = gql`
  query GetDocument($id: ID!) {
    document(id: $id) {
      _id
      type
      createdAt
      updatedAt
      ... on Post {
        title
        content
        author
        avatar
        likes
        likedBy
        comments
        tags
        sharedTo
      }
      ... on Community {
        name
        description
        members
        topics
        avatar
      }
      ... on Classroom {
        name
        description
        instructor
        students
        topics
      }
    }
  }
`;

const UPDATE_DOCUMENT = gql`
  mutation UpdateDocument($id: ID!, $data: JSON!) {
    updateDocument(id: $id, data: $data) {
      _id
      type
      updatedAt
    }
  }
`;

const CREATE_DOCUMENT = gql`
  mutation CreateDocument($data: JSON!) {
    createDocument(data: $data) {
      _id
      type
      createdAt
    }
  }
`;

const DELETE_DOCUMENT = gql`
  mutation DeleteDocument($id: ID!) {
    deleteDocument(id: $id)
  }
`;

export const DatabaseService = {
  async find<T extends DatabaseDocument>(query: { type: string; [key: string]: any }): Promise<T[]> {
    try {
      const { data } = await apolloClient.query({
        query: GET_DOCUMENTS,
        variables: {
          type: query.type,
          query: { ...query, type: undefined }
        }
      });
      return data.documents as T[];
    } catch (error) {
      console.error('Error finding documents:', error);
      throw error;
    }
  },

  async read<T extends DatabaseDocument>(id: string): Promise<T | null> {
    try {
      const { data } = await apolloClient.query({
        query: GET_DOCUMENT,
        variables: { id }
      });
      return data.document as T;
    } catch (error) {
      console.error(`Error reading document ${id}:`, error);
      throw error;
    }
  },

  async create<T extends DatabaseDocument>(doc: T): Promise<T> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_DOCUMENT,
        variables: { data: doc }
      });
      return data.createDocument as T;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  async update<T extends DatabaseDocument>(id: string, doc: Partial<T>): Promise<T> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_DOCUMENT,
        variables: { id, data: doc }
      });
      return data.updateDocument as T;
    } catch (error) {
      console.error(`Error updating document ${id}:`, error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: DELETE_DOCUMENT,
        variables: { id }
      });
      return data.deleteDocument;
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  }
};

export default DatabaseService;