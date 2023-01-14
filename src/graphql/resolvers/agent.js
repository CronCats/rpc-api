require('dotenv').config()
import db from '../../db/index'
import { config } from '../../config'

export default {
  Query: {
    async agents() {
      // const managerContractAddr = config[process.env.NETWORK_ENV].juno.manager
      return []
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
