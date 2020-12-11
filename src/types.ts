import { InputType, Field, ObjectType } from "type-graphql"
import { Request, Response } from "express"
import { User } from "./entities/User"
import { Redis } from "ioredis"
//import session from "express-session"

export type MyContext = {
  req: Request & { session: any }
  res: Response
  redis: Redis
}

// export type SessionUserid = {
//   session: session.Session & Partial<session.SessionData> & e.Express
//   userId: Session & Partial<SessionData>
// }

//creating your custom Arg
@InputType()
export class UsernamePasswordInput {
  @Field()
  username: string
  @Field()
  email: string
  @Field()
  password: string
}

//error types
@ObjectType()
export class FieldError {
  @Field()
  field: string
  @Field()
  message: string
}

//user response type
@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}
