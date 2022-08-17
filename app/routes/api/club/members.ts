import invariant from 'tiny-invariant'
import { json } from '@remix-run/node'
import { forbidden, notFound } from 'remix-utils'
import type { ActionArgs } from '@remix-run/node'

import { prisma } from '~/db.server'
import { parseStringFormData } from '~/utils'
import { requireUserId } from '~/session.server'

export const action = async ({ request }: ActionArgs) => {
  const authedId = await requireUserId(request)

  switch (request.method.toLowerCase()) {
    case 'delete': {
      const { clubId, userId } = await parseStringFormData(request)
      invariant(clubId, 'expected clubId')
      invariant(userId, 'expected userId')

      const member = await prisma.member.findFirst({
        where: { userId, clubId },
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

      if (!member) throw notFound({ message: 'member  not found' })

      if (member.club.ownerId !== authedId && member.userId !== authedId)
        throw forbidden({ message: 'not allowed to delete member' })

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
      throw new Response('Invalid method', { status: 405 })
  }
}

export const loader = () => new Response('Invalid method', { status: 405 })
