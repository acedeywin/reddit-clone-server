import { MikroORM } from "@mikro-orm/core"
import "reflect-metadata"
import express from "express"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import Redis from "ioredis"
import connectRedis from "connect-redis"
import session from "express-session"
import cors from "cors"
// import KnexSessionStore from "connect-session-knex"
// import Knex from "knex"

import microConfig from "./mikro-orm.config"
import { COOKIE_NAME, __prod__ } from "./constants"
import { HelloResolver } from "./resolvers/hello"
import { PostResolver } from "./resolvers/post"
import { UserResolver } from "./resolvers/user"
import { MyContext } from "./types"
//import { sendEmail } from "./utils/sendEmail"

const main = async () => {
  const orm = await MikroORM.init(microConfig)
  await orm.getMigrator().up()

  const app = express(),
    PORT = process.env.PORT || 4500,
    // knexStore = KnexSessionStore(session)

    RedisStore = connectRedis(session),
    redis = new Redis()

  app.use(cors({ origin: "http://localhost:3000", credentials: true }))

  // const knex = Knex({
  //   client: "pg",
  //   connection: {
  //     host: "127.0.0.1",
  //     user: "postgres",
  //     password: "12345",
  //     database: "redditdb",
  //   },
  // })

  // const store = new knexStore({
  //   knex,
  //   tablename: "sessions",
  // })

  // app.use(
  //   session({
  //     name: COOKIE_NAME,
  //     secret: "acedeywin12345@!",
  //     cookie: {
  //       maxAge: 1000 * 60 * 60 * 24 * 365 * 5, //5 years
  //       httpOnly: true,
  //       sameSite: "lax",
  //       // secure: __prod__,
  //     },
  //     store,
  //     saveUninitialized: false,
  //     resave: false,
  //   })
  // )

  app.use(
    session({
      name: COOKIE_NAME,
      secret: "acedeywin12345@!",
      store: new RedisStore({
        client: redis,
        ttl: 260,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 5, //5 years
        httpOnly: true,
        sameSite: "lax", //related to protecting its csrf
        //secure: __prod__, //cookie only work is https
      },
      saveUninitialized: false,
      resave: false,
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res, redis }),
  })

  apolloServer.applyMiddleware({
    app,
    cors: false,
  })

  app.listen(PORT, () => {
    console.log(`Server started on localhost ${PORT}`)
  })
}

main().catch(err => {
  console.log(err)
})
