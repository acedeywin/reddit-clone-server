import DataLoader from "dataloader"
import { Vote } from "../entities/Vote"
import { User } from "../entities/User"

export const createUserLoader = () =>
  new DataLoader<number, User>(async userIds => {
    const users = await User.findByIds(userIds as number[]),
      userIdToUser: Record<number, User> = {}

    users.forEach(user => {
      userIdToUser[user.id] = user
    })

    return userIds.map(userId => userIdToUser[userId])
  })

// export const createVoteLoader = () =>
//   new DataLoader<{ postId: number; userId: number }, Vote | null>(
//     async keys => {
//       const votes = await Vote.findByIds(keys as any),
//         voteIdToVote: Record<string, Vote> = {}
//       votes.forEach(vote => {
//         voteIdToVote[`${vote.userId}|${vote.postId}`] = vote
//       })
//       return keys.map(key => voteIdToVote[`${key.userId}|${key.postId}`])
//     }
//   )
