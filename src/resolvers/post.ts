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
  ObjectType,
} from "type-graphql"
import { MyContext } from "src/types"
import { isAuth } from "../middleware/isAuth"
import { getConnection } from "typeorm"
import { Vote } from "../entities/Vote"
import { User } from "../entities/User"

@InputType()
class PostInput {
  @Field()
  title: string
  @Field()
  text: string
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[]
  @Field()
  hasMore: boolean
}

@Resolver(Post)
export class PostResolver {
  //Field resolver for the posts
  @FieldResolver(() => String)
  async textSnippet(@Root() root: Post) {
    return root.text.slice(0, 80)
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId)
  }

  //query for getting all valid post
  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(30, limit),
      realLimitPlusOne = realLimit + 1

    const replacements: any[] = [realLimitPlusOne]

    if (cursor) {
      replacements.push(new Date(parseInt(cursor)))
    }

    const posts = await getConnection().query(
      `
    select p.*
    from post p

    ${cursor ? `where p."createdAt" < $3` : ""}
    order by p."createdAt" DESC
    limit $1

    `,
      replacements
    )

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    }
  }
  //query for getting a single post by id
  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id, { relations: ["creator"] })
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
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const post = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute()

    return post.raw[0]
  }
  //mutation for deleting a post
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const post = await Post.findOne(id)
    if (!post) {
      return false
    }
    if (post.creatorId !== req.session.userId) {
      throw new Error("Your are not authorized to delete this post")
    }
    await Vote.delete({ postId: id })
    await Post.delete({ id })
    return true
  }
}
