import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core"
import { InputType, Field, ObjectType } from "type-graphql"
import { User } from "./entities/User"

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
}

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
