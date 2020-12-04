import { MyContext, UsernamePasswordInput, UserResponse } from "../types"
import { Resolver, Query, Mutation, Arg, Ctx } from "type-graphql"
import { User } from "../entities/User"
import argon2 from "argon2"

@Resolver()
export class UserResolver {
  //query for getting all valid users
  @Query(() => [User])
  users(@Ctx() { em }: MyContext): Promise<User[]> {
    return em.find(User, {})
  }
  //query for getting a single user by id
  @Query(() => User, { nullable: true })
  user(@Arg("id") id: number, @Ctx() { em }: MyContext): Promise<User | null> {
    return em.findOne(User, { id })
  }
  //mutation for registering a user
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: `The length of username must be greater than two`,
          },
        ],
      }
    }
    if (options.password.length <= 4) {
      return {
        errors: [
          {
            field: "password",
            message: `The length of password must be greater than three`,
          },
        ],
      }
    }
    const hashedPassword = await argon2.hash(options.password)
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    })
    try {
      await em.persistAndFlush(user)
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: `The username is already taken`,
            },
          ],
        }
      }
    }
    return { user }
  }
  //mutation for logging in a user
  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username })
    if (!user) {
      return {
        errors: [
          {
            field: "invalid login",
            message: `User does not exist`,
          },
        ],
      }
    }
    const valid = await argon2.verify(user.password, options.password)
    if (!valid) {
      return {
        errors: [
          {
            field: "invalid login",
            message: `User does not exist`,
          },
        ],
      }
    }

    return { user }
  }
}
