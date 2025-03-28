"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const classroom_resolvers_1 = require("./classroom.resolvers");
const community_resolvers_1 = require("./community.resolvers");
const post_resolvers_1 = require("./post.resolvers");
// Merge resolvers
const resolvers = {
    Query: {
        ...classroom_resolvers_1.classroomResolvers.Query,
        ...community_resolvers_1.communityResolvers.Query,
        ...post_resolvers_1.postResolvers.Query,
    },
    Mutation: {
        ...classroom_resolvers_1.classroomResolvers.Mutation,
        ...community_resolvers_1.communityResolvers.Mutation,
        ...post_resolvers_1.postResolvers.Mutation,
    },
    // Type resolvers
    Classroom: classroom_resolvers_1.classroomResolvers.Classroom,
    Community: community_resolvers_1.communityResolvers.Community,
    Post: post_resolvers_1.postResolvers.Post,
    // Scalar resolvers for dates
    Date: {
        serialize(value) {
            return value instanceof Date ? value.toISOString() : value;
        },
        parseValue(value) {
            return new Date(value);
        },
        parseLiteral(ast) {
            if (ast.kind === 'StringValue') {
                return new Date(ast.value);
            }
            return null;
        },
    },
};
exports.default = resolvers;
//# sourceMappingURL=index.js.map