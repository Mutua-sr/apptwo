import { communityResolvers } from './community.resolvers';
import { postResolvers } from './post.resolvers';

// Merge resolvers
const resolvers = {
  Query: {
    ...communityResolvers.Query,
    ...postResolvers.Query,
  },
  Mutation: {
    ...communityResolvers.Mutation,
    ...postResolvers.Mutation,
  },
  // Type resolvers
  Community: communityResolvers.Community,
  Post: postResolvers.Post,
  // Scalar resolvers for dates
  Date: {
    serialize(value: any) {
      return value instanceof Date ? value.toISOString() : value;
    },
    parseValue(value: any) {
      return new Date(value);
    },
    parseLiteral(ast: any) {
      if (ast.kind === 'StringValue') {
        return new Date(ast.value);
      }
      return null;
    },
  },
};

export default resolvers;