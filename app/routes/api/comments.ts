import invariant from 'tiny-invariant'
import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'

import { prisma } from '~/db.server'
import { requireUserId } from '~/session.server'
import { getErrorMessage, parseStringFormData } from '~/utils'

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  switch (request.method.toLowerCase()) {
    case 'post':
      try {
        const { rootId, parentId, discussionId, content } =
          await parseStringFormData(request)
        invariant(content, 'content required')
        invariant(discussionId, 'chapterId required')
        const memberId = await getMemberIdFromUser(userId, discussionId)
        const comment = await createComment({
          rootId,
          content,
          memberId,
          parentId,
          discussionId,
        })
        return json({ ok: true, comment })
      } catch (error) {
        return json({ error: getErrorMessage(error) }, { status: 500 })
      }

    default:
      throw new Response('Invalid method', { status: 405 })
  }
}

async function getMemberIdFromUser(userId: string, discussionId: string) {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      club: {
        chapters: {
          some: {
            discussions: {
              some: {
                id: discussionId,
              },
            },
          },
        },
      },
    },
    select: { id: true },
  })
  if (!member) {
    throw new Response('Member not associated with Chapter', { status: 403 })
  }

  return member.id
}

async function createComment({
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
  const post = await prisma.comment.create({
    data: {
      rootId,
      parentId,
      discussionId,
      memberId,
      content,
    },
  })

  return post
}
