# Relationships overview

This document summarizes how the main collections relate to each other.

## Identity and denormalization

- `User` is identified by `clerkId`.
- Several collections embed an **author snapshot** (object) rather than storing a MongoDB `ObjectId` reference:
  - `Post.author`
  - `Story.author`
  - `Poll.author`
  - `Comment.author`
  - `ChatMessage.author`

## Graph

- Users create:
  - `User (clerkId)` -> `Post (userId)`
  - `User (clerkId)` -> `Story (userId)`
  - `User (clerkId)` -> `Follow (userId)`
  - `User (clerkId)` -> `Bookmark (userId)`
  - `User (clerkId)` -> `Reaction (userId)`
  - `User (clerkId)` -> `Notification (userId)`
  - `User (clerkId)` -> `PollVote (userId)`

- Content receives engagement:
  - `Post/Story/Poll/Comment (_id)` -> `Reaction (contentType, contentId)`
  - `Post/Story (_id)` -> `Comment (contentType, contentId)`
  - `Comment (_id)` -> `CommentLike (commentId)`
  - `Poll (_id)` -> `PollVote (pollId)`

## Counter caches

The system uses cached counters on content documents to make feeds/queries cheaper:

- `Post.reactionsCount`, `Post.commentsCount`
- `Story.reactionsCount`, `Story.commentsCount`
- `Poll.reactionsCount`, `Poll.totalVotes`
- `Comment.reactionsCount`, `Comment.likesCount`
- `User.followersCount`, `User.followingCount`

These counters must remain consistent with the corresponding collections.
