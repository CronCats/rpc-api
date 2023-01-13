import { gql } from 'apollo-server-express'
import manager from './schemas/manager'
import system from './schemas/system'

const typeDefs = gql`
  ${manager.Single}
  ${system.Single}

  type Query {
    ${manager.Query}
    ${system.Query}
  }
`

// type Mutation {
//     ${ manager.Mutation }
//     ${ system.Mutation }
//   }

// type Subscription {
//     ${ manager.Subscription }
//     ${ system.Subscription }
//   }

export default typeDefs
