if (context.payload.pull_request.merged) {
      const createdAt = context.payload.pull_request.created_at
      const closedAt = context.payload.pull_request.closed_at

      const timeDifference = (createdAt, closedAt) => {
        const a = new Date(createdAt).getTime()
        const b = new Date(closedAt).getTime()

        const milliseconds = b - a
        const minutes = Math.round(milliseconds / 60 / 1000)
        const hours = Math.round(milliseconds / 3600 / 1000)
        const newMinutes = minutes - 60 * hours

        return hours > 0
          ? `${hours} hours ${newMinutes} minutes`
          : `${newMinutes} minutes`
      }

      return await context.octokit.issues.createComment(
        context.issue({
          body: `This pr took ${timeDifference(
            createdAt,
            closedAt
          )} to complete`,
        })
      )
    }
