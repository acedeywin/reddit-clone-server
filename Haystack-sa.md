Implement a mini Haystack.

**TODO:**

Create a Github App which should do the following tasks

1. Every time a pr has the title Haystack, add the label "Haystack" to the pull request. 
1.  Whenever a pr is closed, add the following comment automatically. The message should be something like "This pr took 58 minutes to complete". Completion is first commit to pull request getting merged. 
1. Calculate the average pull request size to that repository and add a comment to the pull request automatically saying "This pr has ${x} size. It's is ${y}% <more|less> than the average pr made to this pr". 

**Bonus TODO:**

Step 1: Run a Github Action which sleeps 10 to 20 seconds randomly after pull request push.

Step 2: Every time the CI runs, add a comment to the pr on how long that Github Action (CI) took in time "The CI took 12.2 seconds".

**After finishing:**

- Make the repository public
- Add a very good description of how it works.
- Email kan@usehaystack.io
