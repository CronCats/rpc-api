import { gql } from 'apollo-server-express'
import agent from './schemas/agent'
import manager from './schemas/manager'
import system from './schemas/system'
import task from './schemas/task'

const typeDefs = gql`
  ${agent.Single}
  ${manager.Single}
  ${system.Single}
  ${task.Single}

  type Query {
    ${agent.Query}
    ${manager.Query}
    ${system.Query}
    ${task.Query}
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
