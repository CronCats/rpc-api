import moment from 'moment-timezone'
import { supportedCurrencies } from '../../helpers/utils'

export default {
  Query: {
    system() {
      return {
        currencies: supportedCurrencies,
        timezones: moment.tz.names(),
      }
    },
  },

  // Mutation: {},

  // Subscription: {},
}
