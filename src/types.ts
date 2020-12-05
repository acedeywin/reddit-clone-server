import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core"
import { InputType, Field, ObjectType } from "type-graphql"
import { Request, Response } from "express"
import { User } from "./entities/User"
//import session from "express-session"

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
  req: Request & { session: any }
  res: Response
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
