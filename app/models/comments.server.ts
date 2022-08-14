import { prisma } from '~/db.server'

export type ThreadedComment = {
  id: string
  content: string
  replyCount: number
  createdAt: string
  discussionId: string
  parentId: string | null
  rootId: string | null

  user: {
    id: string
    avatar: string
    username: string
  }

  replies?: ThreadedComment[]
}

export async function createComment({
  rootId,
  parentId,
  discussionId,
  memberId,
  content,
}: {
  rootId?: string
  parentId?: string
  discussionId: string
  memberId: string
  content: string
}) {
  return prisma.comment.create({
    data: {
      rootId,
      parentId,
      discussionId,
      memberId,
      content,
    },
  })
}
