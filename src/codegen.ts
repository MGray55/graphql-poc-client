import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
    // schema: 'https://swapi-graphql.netlify.app/.netlify/functions/index',
    schema: 'http://localhost:4000',
    documents: ['src/**/*.tsx'],
    ignoreNoDocuments: true, // for better experience with the watcher
    generates: {
        './src/gql/': {
            preset: 'client',
            plugins: []
        }
    }
}

export default config