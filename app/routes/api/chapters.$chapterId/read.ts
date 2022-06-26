import invariant from 'tiny-invariant'
import { ActionFunction, json } from "@remix-run/node";

import { prisma } from '~/db.server'
import { getErrorMessage } from '~/utils'
import { requireUserId } from '~/session.server'

export const action: ActionFunction = async ({ params, request }) => {
  const userId = await requireUserId(request)
  invariant(params.chapterId, 'chapterId required')
  const chapterId = params.chapterId

  const formData = await request.formData()
  const action = formData.get('_action')
  invariant(action, 'missing action')

  switch (request.method.toLowerCase()) {
    case 'post':
      switch (action) {
        case 'MARK_READ': {
          try {
            const memberId = await getMemberIdFromUser(userId, chapterId)
            const progress = await markRead(chapterId, memberId)
            return json({ ok: true, progress })
          } catch (error) {
            return json(
              { error: getErrorMessage(error) },
              {
                status: 500,
              },
            )
          }
        }
        case 'MARK_UNREAD': {
          try {
            const memberId = await getMemberIdFromUser(userId, chapterId)
            const progress = await markUnread(chapterId, memberId)
            return json({ ok: true, progress })
          } catch (error) {
            return json(
              { error: getErrorMessage(error) },
              {
                status: 500,
              },
            )
          }
        }
        default:
          throw new Response('Invalid action', { status: 400 })
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

async function markRead(chapterId: string, memberId: string) {
  return prisma.progress.upsert({
    where: {
      memberId_chapterId: {
        memberId,
        chapterId,
      },
    },
    create: {
      memberId,
      chapterId,
    },
    update: {
      completedAt: new Date(),
    },
  })
}

async function markUnread(chapterId: string, memberId: string) {
  return prisma.progress
    .delete({
      where: {
        memberId_chapterId: {
          memberId,
          chapterId,
        },
      },
    })
    .catch(() => {})
}
