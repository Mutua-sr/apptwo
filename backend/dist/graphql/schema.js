"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeDefs = `
  type User {
    id: ID!
    username: String!
    email: String!
    avatar: String
    role: UserRole!
    createdAt: String!
    updatedAt: String!
  }

  enum UserRole {
    STUDENT
    ADMIN
  }

  type Community {
    id: ID!
    name: String!
    description: String!
    members: Int!
    topics: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  type Post {
    id: ID!
    author: User!
    title: String!
    content: String!
    tags: [String!]!
    likes: Int!
    comments: Int!
    createdAt: String!
    updatedAt: String!
  }

  type ChatMessage {
    id: ID!
    sender: User!
    content: String!
    communityId: ID
    createdAt: String!
  }

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users: [User!]!

    # Community queries
    community(id: ID!): Community
    communities(page: Int, limit: Int): [Community!]!
    myCommunities: [Community!]!

    # Post queries
    post(id: ID!): Post
    posts(page: Int, limit: Int): [Post!]!
    postsByTag(tag: String!, page: Int, limit: Int): [Post!]!

    # Chat queries
    messages(communityId: ID, limit: Int): [ChatMessage!]!
  }

  input CreateCommunityInput {
    name: String!
    description: String!
    topics: [String!]!
  }

  input UpdateCommunityInput {
    name: String
    description: String
    topics: [String!]
  }

  input CreatePostInput {
    title: String!
    content: String!
    tags: [String!]!
  }

  input UpdatePostInput {
    title: String
    content: String
    tags: [String!]
  }

  type Mutation {
    # Community mutations
    createCommunity(input: CreateCommunityInput!): Community!
    updateCommunity(id: ID!, input: UpdateCommunityInput!): Community!
    deleteCommunity(id: ID!): Boolean!

    # Post mutations
    createPost(input: CreatePostInput!): Post!
    updatePost(id: ID!, input: UpdatePostInput!): Post!
    deletePost(id: ID!): Boolean!
    likePost(id: ID!): Post!
    unlikePost(id: ID!): Post!

    # Chat mutations
    sendMessage(content: String!, communityId: ID): ChatMessage!
  }

  type Subscription {
    messageReceived(communityId: ID): ChatMessage!
    postCreated: Post!
    postLiked: Post!
  }
`;
exports.default = typeDefs;
//# sourceMappingURL=schema.js.map