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
      const { inviterId, inviteeId, clubId } = await parseStringFormData(
        request,
      )
      invariant(inviterId, 'expected inviterId')
      invariant(inviteeId, 'expected inviteeId')
      invariant(clubId, 'expected clubId')

      const club = await prisma.club.findUnique({
        where: { id: clubId },
        select: {
          ownerId: true,
        },
      })

      if (!club) return notFound({ message: 'club not found' })
      if (club.ownerId !== userId)
        return forbidden({ message: 'not allowed to delete invite' })

      await prisma.clubInvite
        .delete({
          where: {
            inviterId_inviteeId_clubId: {
              clubId,
              inviteeId,
              inviterId,
            },
          },
        })
        .catch(e => 'invite not found')

      return json({
        ok: true,
      })
    }
    default:
      return new Response('Invalid method', { status: 405 })
  }
}
