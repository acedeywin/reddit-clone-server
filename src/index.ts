import { MikroORM } from "@mikro-orm/core"
import "reflect-metadata"
import express from "express"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import redis from "redis"
import session from "express-session"
import connectRedis from "connect-redis"

import microConfig from "./mikro-orm.config"
import { __prod__ } from "./constants"
import { HelloResolver } from "./resolvers/hello"
import { PostResolver } from "./resolvers/post"
import { UserResolver } from "./resolvers/user"
import { MyContext } from "./types"

const main = async () => {
  const orm = await MikroORM.init(microConfig)
  await orm.getMigrator().up()

  const app = express(),
    PORT = process.env.PORT || 4500,
    RedisStore = connectRedis(session),
    redisClient = redis.createClient()

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 5, //5 years
        httpOnly: true,
        sameSite: "lax", //related to protecting its csrf
        secure: __prod__, //cookie only work is https
      },
      saveUninitialized: false,
      secret: "acedeywin12345@!",
      resave: false,
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  })

  apolloServer.applyMiddleware({ app })

  app.listen(PORT, () => {
    console.log(`Server started on localhost ${PORT}`)
  })
}

main().catch(err => {
  console.log(err)
})
