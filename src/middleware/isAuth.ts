import { MyContext } from "src/types"
import { MiddlewareFn } from "type-graphql"

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error("Your are not logged in.")
  }

  return next()
}
