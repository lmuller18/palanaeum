import invariant from 'tiny-invariant'
import { ActionFunction, json } from "@remix-run/node";

import { prisma } from '~/db.server'
import { requireUserId } from '~/session.server'
import { getErrorMessage, parseStringFormData } from '~/utils'

export const action: ActionFunction = async ({ params, request }) => {
  const userId = await requireUserId(request)

  switch (request.method.toLowerCase()) {
    case 'post':
      try {
        const { chapterId, content, image, context, parentId, rootId } =
          await parseStringFormData(request)
        invariant(content, 'content required')
        invariant(chapterId, 'chapterId required')
        const memberId = await getMemberIdFromUser(userId, chapterId)
        const post = await createPost({
          chapterId,
          content,
          image,
          context,
          parentId,
          rootId,
          memberId,
        })
        return json({ ok: true, post })
      } catch (error) {
        return json(
          { error: getErrorMessage(error) },
          {
            status: 500,
          },
        )
      }

    default:
      throw new Response('Invalid method', { status: 405 })
  }
}

async function getMemberIdFromUser(userId: string, chapterId: string) {
  const member = await prisma.member.findFirst({
    where: {
      userId,
      club: {
        chapters: {
          some: {
            id: chapterId,
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

async function createPost({
  chapterId,
  content,
  image,
  context,
  parentId,
  rootId,
  memberId,
}: {
  chapterId: string
  content: string
  memberId: string
  image?: string
  context?: string
  parentId?: string
  rootId?: string
}) {
  const post = await prisma.post.create({
    data: {
      chapterId,
      content,
      image,
      context,
      parentId,
      rootId,
      memberId,
    },
  })

  return post
}
