import "reflect-metadata"
import dotenv from "dotenv-safe"
import express from "express"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import Redis from "ioredis"
import connectRedis from "connect-redis"
import session from "express-session"
import cors from "cors"
import { createConnection } from "typeorm"
import path from "path"

import { COOKIE_NAME, __prod__ } from "./constants"
import { HelloResolver } from "./resolvers/hello"
import { PostResolver } from "./resolvers/post"
import { UserResolver } from "./resolvers/user"
import { User } from "./entities/User"
import { Post } from "./entities/Post"
import { VoteResolver } from "./resolvers/vote"
import { Vote } from "./entities/Vote"
import { createUserLoader } from "./utils/createLoader"

dotenv.config()

const main = async () => {
  const connection = await createConnection({
    type: "postgres",
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB,
    //synchronize: true,
    logging: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User, Vote],
  })

  const app = express(),
    PORT = process.env.PORT || 4500,
    RedisStore = connectRedis(session),
    redis = new Redis(process.env.REDIS_URL)

  app.set("proxy", 1)
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))

  app.use(
    session({
      name: COOKIE_NAME,
      secret: process.env.SESSION_SECRET as string,
      store: new RedisStore({
        client: redis,
        ttl: 260,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 5, //5 years
        httpOnly: true,
        sameSite: "lax", //related to protecting its csrf
        secure: __prod__, //cookie only work is https
        domain: __prod__ ? ".herokuapp.com" : undefined,
      },
      saveUninitialized: false,
      resave: false,
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver, VoteResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
    }),
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
