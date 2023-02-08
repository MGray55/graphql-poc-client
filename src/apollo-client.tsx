import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
// import { setContext } from '@apollo/client/link/context';

const cache = new InMemoryCache();

const link = createHttpLink({
  uri: '/graphql',
  credentials: 'same-origin'
});

// const httpLink = createHttpLink({
//   uri: '/graphql',
// });
//
// const authLink = setContext((_, { headers }) => {
//   // get the authentication token from local storage if it exists
//   const token = localStorage.getItem('token');
//   // return the headers to the context so httpLink can read them
//   return {
//     headers: {
//       ...headers,
//       authorization: token ? `Bearer ${token}` : "",
//     }
//   }
// });

const client = new ApolloClient({
  // 4000 is direct to the Apollo standalone server
  // 4001 is Apollo through Express middleware
  cache: cache,
  link,
  // link: authLink.concat(httpLink),
  uri: 'http://localhost:4000/',

  // Provide some optional constructor fields
  name: 'react-web-client',
  version: '1.3',
  queryDeduplication: false,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export {
  client
}