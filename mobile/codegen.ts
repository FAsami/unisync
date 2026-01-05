import type { CodegenConfig } from '@graphql-codegen/cli'
import { config } from 'dotenv'

config()

const codegenConfig: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      [process.env.DATAHUB as string]: {
        headers: {
          'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET as string,
        },
      },
    },
  ],
  documents: ['./lib/graphql-operations.ts', './gql/**/*.ts'],
  generates: {
    'lib/graphql/generated.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
      },
    },
  },
}

export default codegenConfig
