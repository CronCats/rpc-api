require('dotenv').config()
import db from '../../db/index'
import { config } from '../../config'

export default {
  Query: {
    async tasks() {
      // const managerContractAddr = config[process.env.NODE_ENV].juno.manager
      return []
    },
    async task(root, args) {
      if (!args.task_hash) return
      // const managerContractAddr = config[process.env.NODE_ENV].juno.manager
      return {}
    },
  },

  // Mutation: {
  // },

  // Subscription: {
  //   // updateUserSettings: {
  //   //   subscribe: () => pubsub.asyncIterator(EVENTS.USER_SETTINGS_UPDATED),
  //   // },
  // },
}
