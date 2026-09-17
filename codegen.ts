import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: 'http://localhost:3001/graphql',
    documents: ["src/**/*.graphql"],
    generates: {
        './src/gql/': {
            preset: 'client',
            config: {
                useTypeImports: true,
            },
        }
    }
}

export default config