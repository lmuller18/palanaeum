import { json } from '@remix-run/node'
import invariant from 'tiny-invariant'
import { forbidden, notFound } from 'remix-utils'
import type { ActionFunction } from '@remix-run/node'

import { prisma } from '~/db.server'
import { parseStringFormData } from '~/utils'
import { requireUserId } from '~/session.server'

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  switch (request.method.toLowerCase()) {
    case 'delete': {
      const { memberId } = await parseStringFormData(request)
      invariant(memberId, 'expected memberId')

      const member = await prisma.member.findUnique({
        where: { id: memberId },
        select: {
          id: true,
          userId: true,
          club: {
            select: {
              ownerId: true,
            },
          },
        },
      })

      if (!member) return notFound({ message: 'member not found' })

      if (member.club.ownerId !== userId && member.userId !== userId)
        return forbidden({ message: 'not allowed to delete member' })

      await prisma.member
        .update({
          where: { id: member.id },
          data: {
            removed: true,
          },
        })
        .catch(e => 'member not found')

      return json({
        ok: true,
      })
    }
    default:
      return new Response('Invalid method', { status: 405 })
  }
}
