import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const server = new ApolloServer({
  typeDefs: `type Query { hello: String }`,
  resolvers: { Query: { hello: () => 'gateway' } }
});

startStandaloneServer(server, { listen: { port: 4000 } }).then(({ url }) => {
  console.log(`🚀 Gateway ready at ${url}`);
});
