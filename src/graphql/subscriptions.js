import { PubSub, withFilter } from 'apollo-server-express'

const EVENTS = {
  USER_SETTINGS_UPDATED: 'USER_SETTINGS_UPDATED',
}

export default {
  pubsub: new PubSub(),
  withFilter,
  EVENTS
}
