import agent from './resolvers/agent'
import manager from './resolvers/manager'
import system from './resolvers/system'
import task from './resolvers/task'

const resolvers = {
  Query: {
    ...(agent.Query ? agent.Query : null),
    ...(manager.Query ? manager.Query : null),
    ...(system.Query ? system.Query : null),
    ...(task.Query ? task.Query : null),
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
