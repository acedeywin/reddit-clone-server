import { MyContext, UsernamePasswordInput, UserResponse } from "../types"
import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  FieldResolver,
  Root,
} from "type-graphql"
import { User } from "../entities/User"
import argon2 from "argon2"
import { COOKIE_NAME, FORGET_PW_PREFIX } from "../constants"
import { validRegister } from "../utils/validateRegister"
import { sendEmail } from "../utils/sendEmail"
import { v4 } from "uuid"
import { getConnection } from "typeorm"

@Resolver(User)
export class UserResolver {
  //query for getting all valid users
  @Query(() => [User])
  users(): Promise<User[]> {
    return User.find()
  }
  //query for getting a single user by id
  @Query(() => User, { nullable: true })
  user(@Arg("id") id: number): Promise<User | undefined> {
    return User.findOne(id)
  }
  //for a current logged in user
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    //you are not logged in
    if (!req.session.userId) {
      return null
    }
    return User.findOne(req.session.userId)
  }
  //Resolver to give permission to email of only a logged in user
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    //this is a current user and post creator, it's ok to show them their own email
    if (req.session.userId === user.id) {
      return user.email
    }
    //this is not the post crreator, hide email from user
    return ""
  }

  //change password mutation
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 4) {
      return {
        errors: [
          {
            field: "newPassword",
            message: `The length of password must be greater than three`,
          },
        ],
      }
    }

    const key = FORGET_PW_PREFIX + token,
      userId = await redis.get(key)
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: `Token expired`,
          },
        ],
      }
    }
    const userIdNum = parseInt(userId),
      user = await User.findOne(userIdNum)

    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: `Token expiredThe user no longer exist`,
          },
        ],
      }
    }

    await User.update(
      { id: userIdNum },
      { password: await argon2.hash(newPassword) }
    )

    //delete the token after password has been changed
    await redis.del(key)

    //auto log users after password reser
    req.session.userId = user.id

    return { user }
  }

  // //forgot password mutation
  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return true
    }

    const token = v4()

    await redis.set(
      FORGET_PW_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    ) //3 days

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    )
    return true
  }

  //mutation for registering a user
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validRegister(options)

    if (errors) return { errors }

    const hashedPassword = await argon2.hash(options.password)
    let user

    try {
      //User.create({}).save()
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
        })
        .returning("*")
        .execute()

      user = result.raw[0]
    } catch (err) {
      //err.detail.includes("already exists")
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
    //this will keep the user logged in
    req.session.userId = user.id
    return { user }
  }
  //mutation for logging in a user
  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    )
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: `User does not exist`,
          },
        ],
      }
    }
    const valid = await argon2.verify(user.password, password)
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: `User does not exist`,
          },
        ],
      }
    }

    req.session.userId = user.id

    return { user }
  }
  //mutation for logout
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise(resolve => {
      req.session.destroy((err: any) => {
        res.clearCookie(COOKIE_NAME)
        if (err) {
          console.log(err)
          resolve(false)
          return
        }
        resolve(true)
      })
    })
  }
}
