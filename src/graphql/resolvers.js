import manager from './resolvers/manager'
import system from './resolvers/system'

const resolvers = {
  Query: {
    ...(manager.Query ? manager.Query : null),
    ...(system.Query ? system.Query : null),
  },

  // Mutation: {
  //   ...(manager.Mutation ? manager.Mutation : null),
  //   ...(system.Mutation ? system.Mutation : null),
  // },

  // Subscription: {
  //   ...(manager.Subscription ? manager.Subscription : null),
  //   ...(system.Subscription ? system.Subscription : null),
  // },
}

export default resolvers
