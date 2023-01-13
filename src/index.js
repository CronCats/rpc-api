import regeneratorRuntime from "regenerator-runtime"
require('dotenv').config()
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import bodyParser from 'body-parser'
import { createServer } from 'http'
import { ApolloServer } from 'apollo-server-express'
import typeDefs from './graphql/schema'
import resolvers from './graphql/resolvers'
// import { authContext, wsAuthContext } from './helpers/session'
// import { initCache } from './helpers/cache'

const port = process.env.PORT || 8080

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // context: authContext,
  // subscriptions: {
  //   onConnect: wsAuthContext,
  // },
  debug: process.env.NODE_ENV === 'development',
})

// TESTING!
// if (process.env.RUN_TEST_FORMATTERS === 'true') require('./helpers/testFormatter')
// if (process.env.RUN_TEST_EMAILS === 'true') require('./helpers/testEmails')
// if (process.env.RUN_TEST_DBS === 'true') require('./helpers/testDbs')

// // start redis immediately, because we always need it, and dont like boot errors
// try {
//   // REDIS: Every node needs it to sync the queue
//   const sys = require('util')
//   const exec = require('child_process').exec

//   function puts(error, stdout, stderr) {
//     if (error) console.log('redis error', error)
//   }
//   exec('redis-cli shutdown')
//   exec('redis-server', puts)
// } catch(e) {
//   // dont care
// }

const app = express()
server.applyMiddleware({ app })
app.use(cors())
app.use(helmet())
app.use(express.static('static'))
app.use(bodyParser.json())

app.get('/*', (req, res) => {
  res.status(200).send('OK')
})

const httpServer = createServer(app)
server.installSubscriptionHandlers(httpServer)

httpServer.listen({ port }, async () => {
  console.log(`😻 CronCat`)
  console.log(`🤖 Server ready at http://localhost:${port}${server.graphqlPath}`)
  console.log(`🚀 Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`)

  // // Start cache
  // initCache()
})