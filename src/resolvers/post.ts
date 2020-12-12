import { Post } from "../entities/Post"
import {
  Resolver,
  Query,
  Arg,
  Mutation,
  InputType,
  Field,
  Ctx,
  UseMiddleware,
  Int,
  FieldResolver,
  Root,
} from "type-graphql"
import { MyContext } from "src/types"
import { isAuth } from "../middleware/isAuth"
import { getConnection } from "typeorm"

@InputType()
class PostInput {
  @Field()
  title: string
  @Field()
  text: string
}

@Resolver(Post)
export class PostResolver {
  //Field resolver for the posts
  @FieldResolver(() => String)
  async textSnippet(@Root() root: Post) {
    return root.text.slice(0, 80)
  }

  //query for getting all valid post
  @Query(() => [Post])
  posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<Post[]> {
    const realLimit = Math.min(30, limit)

    const queryBuilder = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .orderBy('"createdAt"', "DESC")
      .take(realLimit)

    if (cursor) {
      queryBuilder.where('"createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      })
    }

    return queryBuilder.getMany()
  }
  //query for getting a single post by id
  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id)
  }
  //mutation for creating a post
  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save()
  }
  //mutation for updating a post
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id)
    if (!post) {
      return null
    }
    if (typeof title !== "undefined") {
      await Post.update({ id }, { title })
    }
    return post
  }
  //mutation for deleting a post
  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id)
    return true
  }
}
