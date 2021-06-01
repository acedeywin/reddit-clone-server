import { isAuth } from "../middleware/isAuth"
import { MyContext } from "../types"
import { Arg, Ctx, Int, Mutation, Resolver, UseMiddleware } from "type-graphql"
import { getConnection } from "typeorm"
import { Vote } from "../entities/Vote"

@Resolver(Vote)
export class VoteResolver {
  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session,
      isVote = value !== -1,
      realValue = isVote ? 1 : -1,
      vote = await Vote.findOne({ where: { postId, userId } })

    //The user has voted on the post before and they are changing their vote
    if (vote && vote.value !== realValue) {
      await getConnection().transaction(async tm => {
        await tm.query(
          `update vote set value = $1 where "postId" = $2 and "userId" = $3`,
          [realValue, postId, userId]
        )
        await tm.query(`update post set points = points + $1 where id = $2`, [
          1 * realValue,
          postId,
        ])
      })
    } else if (!vote) {
      await Vote.insert({
        userId,
        postId,
        value: realValue,
      })

      await getConnection().query(
        `update post set points = points + $1 where id = $2`,
        [realValue, postId]
      )
    }

    return true
  }
}

/*
START TRANSACTION;

insert into vote ("userId", "postId", value)
values (${userId}, ${postId}, ${realValue});

update post set points = points + ${realValue}) where id = ${postId}

COMMIT;
*/
