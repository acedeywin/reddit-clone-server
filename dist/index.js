"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const dotenv_safe_1 = __importDefault(require("dotenv-safe"));
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const ioredis_1 = __importDefault(require("ioredis"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const typeorm_1 = require("typeorm");
const path_1 = __importDefault(require("path"));
const constants_1 = require("./constants");
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const User_1 = require("./entities/User");
const Post_1 = require("./entities/Post");
const vote_1 = require("./resolvers/vote");
const Vote_1 = require("./entities/Vote");
const createLoader_1 = require("./utils/createLoader");
dotenv_safe_1.default.config();
const main = async () => {
    const connection = await typeorm_1.createConnection({
        type: "postgres",
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB,
        logging: true,
        migrations: [path_1.default.join(__dirname, "./migrations/*")],
        entities: [Post_1.Post, User_1.User, Vote_1.Vote],
    });
    const app = express_1.default(), PORT = process.env.PORT || 4500, RedisStore = connect_redis_1.default(express_session_1.default), redis = new ioredis_1.default(process.env.REDIS_URL);
    app.set("proxy", 1);
    app.use(cors_1.default({ origin: process.env.CORS_ORIGIN, credentials: true }));
    app.use(express_session_1.default({
        name: constants_1.COOKIE_NAME,
        secret: process.env.SESSION_SECRET,
        store: new RedisStore({
            client: redis,
            ttl: 260,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 5,
            httpOnly: true,
            sameSite: "lax",
            secure: constants_1.__prod__,
            domain: constants_1.__prod__ ? ".herokuapp.com" : undefined,
        },
        saveUninitialized: false,
        resave: false,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await type_graphql_1.buildSchema({
            resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver, vote_1.VoteResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({
            req,
            res,
            redis,
            userLoader: createLoader_1.createUserLoader(),
        }),
    });
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    app.listen(PORT, () => {
        console.log(`Server started on localhost ${PORT}`);
    });
};
main().catch(err => {
    console.log(err);
});
//# sourceMappingURL=index.js.map